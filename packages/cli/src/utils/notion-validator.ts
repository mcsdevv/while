/**
 * Notion Token Validation Utility
 *
 * Validates Notion API tokens and retrieves accessible databases.
 */

import { Client } from "@notionhq/client";
import type { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";

export interface NotionDatabase {
  id: string;
  name: string;
  url: string;
}

export interface ValidationResult {
  valid: boolean;
  integrationName?: string;
  workspaceName?: string;
  databases: NotionDatabase[];
  error?: string;
}

/**
 * Validate a Notion API token and retrieve accessible databases
 */
export async function validateNotionToken(apiToken: string): Promise<ValidationResult> {
  try {
    const notion = new Client({ auth: apiToken });

    // Test the token by searching for databases
    const response = await notion.search({
      filter: { property: "object", value: "database" },
      page_size: 50,
    });

    const databases = response.results
      .filter(
        (result): result is DatabaseObjectResponse =>
          result.object === "database" && "title" in result,
      )
      .map((db) => ({
        id: db.id,
        name: db.title?.[0]?.plain_text || "Untitled",
        url: db.url,
      }));

    // Get integration info
    let integrationName: string | undefined;
    let workspaceName: string | undefined;

    try {
      const botInfo = await notion.users.me({});
      if (botInfo.type === "bot" && botInfo.bot) {
        integrationName = botInfo.name ?? undefined;
        if ("workspace_name" in botInfo.bot) {
          workspaceName = botInfo.bot.workspace_name as string | undefined;
        }
      }
    } catch {
      // Non-critical, continue without bot info
    }

    return {
      valid: true,
      integrationName,
      workspaceName,
      databases,
    };
  } catch (error) {
    return {
      valid: false,
      databases: [],
      error: error instanceof Error ? error.message : "Failed to validate token",
    };
  }
}
