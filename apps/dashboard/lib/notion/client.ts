import { getLegacyFieldMapping, getNotionConfig } from "@/lib/settings";
import type { Event } from "@/lib/types";
import { Client } from "@notionhq/client";
import type {
  PageObjectResponse,
  QueryDatabaseResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

// Cached client and config (lazy initialization)
let cachedNotionClient: Client | null = null;
let cachedDatabaseId: string | null = null;

/**
 * Get or create the Notion client with credentials from settings or env vars.
 */
async function getClient(): Promise<Client> {
  if (cachedNotionClient) {
    return cachedNotionClient;
  }

  const config = await getNotionConfig();
  cachedNotionClient = new Client({ auth: config.apiToken });
  cachedDatabaseId = config.databaseId;

  return cachedNotionClient;
}

/**
 * Get the database ID from config.
 */
async function getDatabaseId(): Promise<string> {
  if (cachedDatabaseId) {
    return cachedDatabaseId;
  }

  const config = await getNotionConfig();
  cachedDatabaseId = config.databaseId;
  return cachedDatabaseId;
}

/**
 * Reset cached client (useful when credentials change).
 */
export function resetNotionClient(): void {
  cachedNotionClient = null;
  cachedDatabaseId = null;
}

// Type guard for page object responses
function isPageObjectResponse(page: unknown): page is PageObjectResponse {
  return (
    typeof page === "object" &&
    page !== null &&
    "properties" in page &&
    "object" in page &&
    (page as { object: string }).object === "page"
  );
}

// Helper to extract property values from Notion pages
function getPropertyValue(properties: PageObjectResponse["properties"], key: string): unknown {
  const prop = properties[key];
  if (!prop) return null;

  switch (prop.type) {
    case "title":
      return prop.title[0]?.plain_text || "";
    case "rich_text":
      return prop.rich_text[0]?.plain_text || "";
    case "date":
      return prop.date;
    case "select":
      return prop.select?.name || null;
    case "number":
      return prop.number;
    default:
      return null;
  }
}

// Convert Notion page to Event
export async function notionPageToEvent(page: PageObjectResponse): Promise<Event | null> {
  try {
    const properties = page.properties;
    const fieldMapping = await getLegacyFieldMapping();

    const title = getPropertyValue(properties, fieldMapping.title) as string;
    const description = getPropertyValue(properties, fieldMapping.description) as
      | string
      | undefined;
    const location = getPropertyValue(properties, fieldMapping.location) as string | undefined;
    const gcalEventId = getPropertyValue(properties, fieldMapping.gcalEventId) as
      | string
      | undefined;
    const reminders = getPropertyValue(properties, fieldMapping.reminders) as number | undefined;

    const dateRange = getPropertyValue(properties, fieldMapping.date) as {
      start?: string;
      end?: string;
    } | null;

    if (!dateRange?.start) {
      console.warn(`Page ${page.id} missing start date`);
      return null;
    }

    const startTime = new Date(dateRange.start);
    const endTime = dateRange.end
      ? new Date(dateRange.end)
      : new Date(startTime.getTime() + 3600000); // +1 hour default

    const statusValue = getPropertyValue(properties, "Status") as string | undefined;
    const status = statusValue?.toLowerCase() as Event["status"];

    return {
      id: page.id,
      title: title || "Untitled",
      description,
      startTime,
      endTime,
      location,
      status,
      reminders,
      notionPageId: page.id,
      gcalEventId,
    };
  } catch (error) {
    console.error("Error converting Notion page to event:", error);
    return null;
  }
}

// Fetch all events from Notion database
export async function fetchNotionEvents(): Promise<Event[]> {
  try {
    const client = await getClient();
    const databaseId = await getDatabaseId();
    const fieldMapping = await getLegacyFieldMapping();

    const response: QueryDatabaseResponse = await client.databases.query({
      database_id: databaseId,
      filter: {
        property: fieldMapping.date,
        date: {
          is_not_empty: true,
        },
      },
    });

    const events: Event[] = [];
    for (const result of response.results) {
      if (isPageObjectResponse(result)) {
        const event = await notionPageToEvent(result);
        if (event) {
          events.push(event);
        }
      }
    }

    return events;
  } catch (error) {
    console.error("Error fetching Notion events:", error);
    throw error;
  }
}

// Create a new event in Notion
export async function createNotionEvent(event: Event): Promise<string> {
  try {
    const client = await getClient();
    const databaseId = await getDatabaseId();
    const fieldMapping = await getLegacyFieldMapping();

    const response = await client.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        [fieldMapping.title]: {
          title: [
            {
              text: {
                content: event.title,
              },
            },
          ],
        },
        [fieldMapping.date]: {
          date: {
            start: event.startTime.toISOString(),
            end: event.endTime.toISOString(),
          },
        },
        ...(event.description && {
          [fieldMapping.description]: {
            rich_text: [
              {
                text: {
                  content: event.description,
                },
              },
            ],
          },
        }),
        ...(event.location && {
          [fieldMapping.location]: {
            rich_text: [
              {
                text: {
                  content: event.location,
                },
              },
            ],
          },
        }),
        ...(event.status && {
          Status: {
            select: {
              name: event.status.charAt(0).toUpperCase() + event.status.slice(1),
            },
          },
        }),
        ...(event.reminders !== undefined && {
          [fieldMapping.reminders]: {
            number: event.reminders,
          },
        }),
        ...(event.gcalEventId && {
          [fieldMapping.gcalEventId]: {
            rich_text: [
              {
                text: {
                  content: event.gcalEventId,
                },
              },
            ],
          },
        }),
      },
    });

    return response.id;
  } catch (error) {
    console.error("Error creating Notion event:", error);
    throw error;
  }
}

// Update an existing Notion event
export async function updateNotionEvent(pageId: string, event: Partial<Event>): Promise<void> {
  try {
    const client = await getClient();
    const fieldMapping = await getLegacyFieldMapping();

    const properties: UpdatePageParameters["properties"] = {};

    if (event.title !== undefined) {
      properties[fieldMapping.title] = {
        title: [{ text: { content: event.title } }],
      };
    }

    if (event.startTime && event.endTime) {
      properties[fieldMapping.date] = {
        date: {
          start: event.startTime.toISOString(),
          end: event.endTime.toISOString(),
        },
      };
    } else if (event.startTime) {
      properties[fieldMapping.date] = {
        date: {
          start: event.startTime.toISOString(),
        },
      };
    }

    if (event.description !== undefined) {
      properties[fieldMapping.description] = {
        rich_text: [{ text: { content: event.description } }],
      };
    }

    if (event.location !== undefined) {
      properties[fieldMapping.location] = {
        rich_text: [{ text: { content: event.location } }],
      };
    }

    if (event.status) {
      properties.Status = {
        select: {
          name: event.status.charAt(0).toUpperCase() + event.status.slice(1),
        },
      };
    }

    if (event.reminders !== undefined) {
      properties[fieldMapping.reminders] = {
        number: event.reminders,
      };
    }

    if (event.gcalEventId !== undefined) {
      properties[fieldMapping.gcalEventId] = {
        rich_text: [{ text: { content: event.gcalEventId } }],
      };
    }

    await client.pages.update({
      page_id: pageId,
      properties,
    });
  } catch (error) {
    console.error("Error updating Notion event:", error);
    throw error;
  }
}

// Delete a Notion event (archive the page)
export async function deleteNotionEvent(pageId: string): Promise<void> {
  try {
    const client = await getClient();

    await client.pages.update({
      page_id: pageId,
      archived: true,
    });
  } catch (error: unknown) {
    // If the page is already archived, treat it as success
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    const errorMessage = error instanceof Error ? error.message : "";

    if (errorCode === "validation_error" && errorMessage.includes("archived")) {
      console.log(`Page ${pageId} is already archived, skipping`);
      return;
    }
    console.error("Error deleting Notion event:", error);
    throw error;
  }
}

// Get a single event by page ID
export async function getNotionEvent(pageId: string): Promise<Event | null> {
  try {
    const client = await getClient();

    const page = await client.pages.retrieve({
      page_id: pageId,
    });

    if (isPageObjectResponse(page)) {
      return notionPageToEvent(page);
    }

    return null;
  } catch (error) {
    console.error("Error fetching Notion event:", error);
    throw error;
  }
}

// ============================================================
// Webhook Management (Notion API v1)
// ============================================================

interface CreateWebhookParams {
  url: string;
  databaseId: string;
  eventTypes?: string[];
}

interface WebhookResponse {
  id: string;
  url: string;
  created_time: string;
  event_types: string[];
  state: string;
}

/**
 * Create a webhook subscription for the Notion database
 * Note: This uses the Notion API directly as the SDK doesn't support webhooks yet
 */
export async function createNotionWebhook(params: CreateWebhookParams): Promise<WebhookResponse> {
  try {
    const config = await getNotionConfig();

    const response = await fetch("https://api.notion.com/v1/webhooks", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        url: params.url,
        event_types: params.eventTypes || ["page.content_updated"],
        database_id: params.databaseId,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create webhook: ${response.status} ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating Notion webhook:", error);
    throw error;
  }
}

/**
 * Delete a webhook subscription
 */
export async function deleteNotionWebhook(webhookId: string): Promise<void> {
  try {
    const config = await getNotionConfig();

    const response = await fetch(`https://api.notion.com/v1/webhooks/${webhookId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!response.ok && response.status !== 404) {
      const error = await response.text();
      throw new Error(`Failed to delete webhook: ${response.status} ${error}`);
    }
  } catch (error) {
    console.error("Error deleting Notion webhook:", error);
    throw error;
  }
}

/**
 * List all webhook subscriptions
 */
export async function listNotionWebhooks(): Promise<WebhookResponse[]> {
  try {
    const config = await getNotionConfig();

    const response = await fetch("https://api.notion.com/v1/webhooks", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Notion-Version": "2022-06-28",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to list webhooks: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error("Error listing Notion webhooks:", error);
    throw error;
  }
}
