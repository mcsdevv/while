import { env } from "@/lib/env";
import type { Event } from "@/lib/types";
import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";

// Suppress deprecation warning from googleapis library
// This is a known issue in googleapis and will be fixed in a future version
// See: https://github.com/googleapis/google-api-nodejs-client/issues/3188
process.removeAllListeners("warning");
const originalEmitWarning = process.emitWarning;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
process.emitWarning = (warning: any, ...args: any[]) => {
  // Suppress DEP0169 warning from googleapis
  const warningStr = warning instanceof Error ? warning.message : warning?.toString() || "";
  if (warningStr.includes("DEP0169")) {
    return;
  }
  return originalEmitWarning.call(process, warning, ...args);
};

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  env.GOOGLE_CALENDAR_CLIENT_ID,
  env.GOOGLE_CALENDAR_CLIENT_SECRET,
);

// Set credentials with refresh token
oauth2Client.setCredentials({
  refresh_token: env.GOOGLE_CALENDAR_REFRESH_TOKEN,
});

// Initialize Calendar API
export const calendarClient = google.calendar({
  version: "v3",
  auth: oauth2Client,
});

// Helper to check if an event is all-day
function isAllDayEvent(startTime: Date, endTime: Date): boolean {
  // Check if both times are at midnight (00:00:00)
  const startAtMidnight =
    startTime.getUTCHours() === 0 &&
    startTime.getUTCMinutes() === 0 &&
    startTime.getUTCSeconds() === 0;

  const endAtMidnight =
    endTime.getUTCHours() === 0 && endTime.getUTCMinutes() === 0 && endTime.getUTCSeconds() === 0;

  return startAtMidnight && endAtMidnight;
}

// Format date for Google Calendar all-day events (YYYY-MM-DD)
function formatAllDayDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Convert Google Calendar event to our Event type
export function gcalEventToEvent(gcalEvent: calendar_v3.Schema$Event): Event | null {
  try {
    // Skip special read-only events like birthdays from Google Contacts
    if (gcalEvent.eventType === "birthday") {
      console.log(`Skipping birthday event: ${gcalEvent.summary}`);
      return null;
    }

    if (!gcalEvent.id || !gcalEvent.summary) {
      console.warn("GCal event missing required fields:", gcalEvent.id);
      return null;
    }

    const startTime = gcalEvent.start?.dateTime || gcalEvent.start?.date;
    const endTime = gcalEvent.end?.dateTime || gcalEvent.end?.date;

    if (!startTime || !endTime) {
      console.warn("GCal event missing start or end time:", gcalEvent.id);
      return null;
    }

    const notionPageId = gcalEvent.extendedProperties?.private?.notion_page_id;

    // Map Google Calendar status to our status
    let status: Event["status"] = "confirmed";
    if (gcalEvent.status === "cancelled") {
      status = "cancelled";
    } else if (gcalEvent.status === "tentative") {
      status = "tentative";
    }

    // Extract reminder minutes (take first reminder if exists)
    const reminders = gcalEvent.reminders?.overrides?.[0]?.minutes;

    return {
      id: gcalEvent.id,
      title: gcalEvent.summary,
      description: gcalEvent.description || undefined,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: gcalEvent.location || undefined,
      status,
      reminders: reminders || undefined,
      gcalEventId: gcalEvent.id,
      notionPageId: notionPageId || undefined,
    };
  } catch (error) {
    console.error("Error converting GCal event to Event:", error);
    return null;
  }
}

// Fetch all events from Google Calendar
export async function fetchGcalEvents(timeMin?: Date, timeMax?: Date): Promise<Event[]> {
  try {
    // Default to fetching events from now up to 1 year in the future
    const defaultTimeMin = timeMin || new Date();
    const defaultTimeMax = timeMax || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now

    const response = await calendarClient.events.list({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      timeMin: defaultTimeMin.toISOString(),
      timeMax: defaultTimeMax.toISOString(),
      singleEvents: true, // Expand recurring events into instances
      orderBy: "startTime",
    });

    const events: Event[] = [];
    for (const gcalEvent of response.data.items || []) {
      const event = gcalEventToEvent(gcalEvent);
      if (event) {
        events.push(event);
      }
    }

    return events;
  } catch (error) {
    console.error("Error fetching Google Calendar events:", error);
    throw error;
  }
}

// Fetch events since last sync using sync token (incremental sync for webhooks)
export async function fetchGcalEventsSince(syncToken?: string): Promise<{
  events: Event[];
  nextSyncToken?: string;
  invalidToken?: boolean;
}> {
  try {
    const response = await calendarClient.events.list({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      syncToken: syncToken,
      singleEvents: true,
      maxResults: 2500, // Maximum allowed by API
    });

    const events: Event[] = [];
    for (const gcalEvent of response.data.items || []) {
      const event = gcalEventToEvent(gcalEvent);
      if (event) {
        events.push(event);
      }
    }

    return {
      events,
      nextSyncToken: response.data.nextSyncToken || undefined,
      invalidToken: false,
    };
  } catch (error: unknown) {
    // Sync token can become invalid if calendar settings change
    const errorMessage = error instanceof Error ? error.message : "";
    const errorCode =
      error && typeof error === "object" && "code" in error
        ? (error as { code: unknown }).code
        : null;

    if (errorMessage.includes("Sync token") || errorCode === 410) {
      console.warn("Sync token invalid, need to perform full sync");
      return {
        events: [],
        invalidToken: true,
      };
    }

    console.error("Error fetching Google Calendar events with sync token:", error);
    throw error;
  }
}

// Create a new event in Google Calendar
export async function createGcalEvent(event: Event): Promise<string> {
  try {
    // Check if this is an all-day event
    const isAllDay = isAllDayEvent(event.startTime, event.endTime);

    const gcalEvent: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: isAllDay
        ? { date: formatAllDayDate(event.startTime) }
        : { dateTime: event.startTime.toISOString(), timeZone: "UTC" },
      end: isAllDay
        ? { date: formatAllDayDate(event.endTime) }
        : { dateTime: event.endTime.toISOString(), timeZone: "UTC" },
      status: event.status || "confirmed",
      extendedProperties: {
        private: {
          ...(event.notionPageId && { notion_page_id: event.notionPageId }),
        },
      },
    };

    // Add reminders if specified
    // Only set reminders if there's a valid number value
    if (event.reminders !== undefined && typeof event.reminders === "number") {
      gcalEvent.reminders = {
        useDefault: false,
        overrides: [
          {
            method: "popup",
            minutes: event.reminders,
          },
        ],
      };
    }

    const response = await calendarClient.events.insert({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      requestBody: gcalEvent,
    });

    if (!response.data.id) {
      throw new Error("Failed to create Google Calendar event: no ID returned");
    }

    return response.data.id;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw error;
  }
}

// Update an existing Google Calendar event
export async function updateGcalEvent(eventId: string, event: Partial<Event>): Promise<void> {
  try {
    const gcalEvent: calendar_v3.Schema$Event = {};

    if (event.title !== undefined) {
      gcalEvent.summary = event.title;
    }

    if (event.description !== undefined) {
      gcalEvent.description = event.description;
    }

    if (event.location !== undefined) {
      gcalEvent.location = event.location;
    }

    if (event.startTime && event.endTime) {
      // Check if this is an all-day event
      if (isAllDayEvent(event.startTime, event.endTime)) {
        // All-day events use 'date' field instead of 'dateTime'
        gcalEvent.start = {
          date: formatAllDayDate(event.startTime),
        };
        gcalEvent.end = {
          date: formatAllDayDate(event.endTime),
        };
      } else {
        // Timed events use 'dateTime' field
        gcalEvent.start = {
          dateTime: event.startTime.toISOString(),
          timeZone: "UTC",
        };
        gcalEvent.end = {
          dateTime: event.endTime.toISOString(),
          timeZone: "UTC",
        };
      }
    } else if (event.startTime) {
      gcalEvent.start = {
        dateTime: event.startTime.toISOString(),
        timeZone: "UTC",
      };
    } else if (event.endTime) {
      gcalEvent.end = {
        dateTime: event.endTime.toISOString(),
        timeZone: "UTC",
      };
    }

    if (event.status) {
      gcalEvent.status = event.status;
    }

    // Only set reminders if there's a valid number value
    if (event.reminders !== undefined && typeof event.reminders === "number") {
      gcalEvent.reminders = {
        useDefault: false,
        overrides: [
          {
            method: "popup",
            minutes: event.reminders,
          },
        ],
      };
    }

    // Try to set extended properties, but skip for special event types (like birthdays)
    // that don't support them
    if (event.notionPageId !== undefined) {
      gcalEvent.extendedProperties = {
        private: {
          notion_page_id: event.notionPageId,
        },
      };
    }

    try {
      await calendarClient.events.patch({
        calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
        eventId,
        requestBody: gcalEvent,
      });
    } catch (updateError: unknown) {
      // If error is about extended properties on special event types (birthdays, etc.)
      // retry without extended properties
      const errorMessage = updateError instanceof Error ? updateError.message : "";

      if (errorMessage.includes("extended properties") || errorMessage.includes("birthday")) {
        console.warn(
          `Cannot set extended properties on this event type (${eventId}), retrying without...`,
        );
        gcalEvent.extendedProperties = undefined;
        await calendarClient.events.patch({
          calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
          eventId,
          requestBody: gcalEvent,
        });
      } else {
        throw updateError;
      }
    }
  } catch (error) {
    console.error("Error updating Google Calendar event:", error);
    throw error;
  }
}

// Delete a Google Calendar event
export async function deleteGcalEvent(eventId: string): Promise<void> {
  try {
    await calendarClient.events.delete({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      eventId,
    });
  } catch (error) {
    console.error("Error deleting Google Calendar event:", error);
    throw error;
  }
}

/**
 * Find a Google Calendar event by its Notion page ID
 * Searches recent events (past 30 days + future) for matching notionPageId
 */
export async function findGcalEventByNotionId(notionPageId: string): Promise<Event | null> {
  try {
    // Search events from 30 days ago to 1 year in the future
    const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    const events = await fetchGcalEvents(timeMin, timeMax);

    // Find the event with matching Notion page ID
    const matchingEvent = events.find((event) => event.notionPageId === notionPageId);

    return matchingEvent || null;
  } catch (error) {
    console.error("Error finding GCal event by Notion ID:", error);
    throw error;
  }
}

// Get a single event by ID
export async function getGcalEvent(eventId: string): Promise<Event | null> {
  try {
    const response = await calendarClient.events.get({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      eventId,
    });

    return gcalEventToEvent(response.data);
  } catch (error) {
    console.error("Error fetching Google Calendar event:", error);
    throw error;
  }
}

// Set up push notifications (webhook) for calendar changes
export async function setupGcalWebhook(webhookUrl: string): Promise<{
  channelId: string;
  resourceId: string;
  expiration: number;
}> {
  try {
    const response = await calendarClient.events.watch({
      calendarId: env.GOOGLE_CALENDAR_CALENDAR_ID,
      requestBody: {
        id: `gcal-sync-${Date.now()}`, // Unique channel ID
        type: "web_hook",
        address: webhookUrl,
      },
    });

    return {
      channelId: response.data.id || "",
      resourceId: response.data.resourceId || "",
      expiration: Number(response.data.expiration) || 0,
    };
  } catch (error) {
    console.error("Error setting up Google Calendar webhook:", error);
    throw error;
  }
}

// Stop watching calendar changes
export async function stopGcalWebhook(channelId: string, resourceId: string): Promise<void> {
  try {
    await calendarClient.channels.stop({
      requestBody: {
        id: channelId,
        resourceId,
      },
    });
  } catch (error) {
    console.error("Error stopping Google Calendar webhook:", error);
    throw error;
  }
}
