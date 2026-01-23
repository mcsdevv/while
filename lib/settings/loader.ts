/**
 * Unified configuration loader that reads from settings (Redis) or env vars.
 * Priority: Settings > Env vars > Defaults (for field mapping only)
 */

import { getSettings } from "./storage";
import type { FieldMapping } from "./types";
import { DEFAULT_FIELD_MAPPING } from "./types";

export interface GoogleConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  calendarId: string;
}

export interface NotionConfig {
  apiToken: string;
  databaseId: string;
}

/**
 * Get Google Calendar configuration.
 * Tries settings first, falls back to env vars.
 *
 * @throws Error if configuration is not available from either source
 */
export async function getGoogleConfig(): Promise<GoogleConfig> {
  // Try settings first
  const settings = await getSettings();
  if (settings?.google?.clientId && settings?.google?.clientSecret && settings?.google?.refreshToken) {
    return {
      clientId: settings.google.clientId,
      clientSecret: settings.google.clientSecret,
      refreshToken: settings.google.refreshToken,
      calendarId: settings.google.calendarId || "primary",
    };
  }

  // Fall back to env vars
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;
  const calendarId = process.env.GOOGLE_CALENDAR_CALENDAR_ID || "primary";

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Google Calendar configuration not found. " +
        "Either complete setup via the web UI or set GOOGLE_CALENDAR_CLIENT_ID, " +
        "GOOGLE_CALENDAR_CLIENT_SECRET, and GOOGLE_CALENDAR_REFRESH_TOKEN environment variables.",
    );
  }

  return {
    clientId,
    clientSecret,
    refreshToken,
    calendarId,
  };
}

/**
 * Get Notion configuration.
 * Tries settings first, falls back to env vars.
 *
 * @throws Error if configuration is not available from either source
 */
export async function getNotionConfig(): Promise<NotionConfig> {
  // Try settings first
  const settings = await getSettings();
  if (settings?.notion?.apiToken && settings?.notion?.databaseId) {
    return {
      apiToken: settings.notion.apiToken,
      databaseId: settings.notion.databaseId,
    };
  }

  // Fall back to env vars
  const apiToken = process.env.NOTION_API_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!apiToken || !databaseId) {
    throw new Error(
      "Notion configuration not found. " +
        "Either complete setup via the web UI or set NOTION_API_TOKEN and " +
        "NOTION_DATABASE_ID environment variables.",
    );
  }

  return {
    apiToken,
    databaseId,
  };
}

/**
 * Get field mapping configuration.
 * Tries settings first, falls back to defaults.
 */
export async function getFieldMapping(): Promise<FieldMapping> {
  const settings = await getSettings();
  if (settings?.fieldMapping) {
    return {
      ...DEFAULT_FIELD_MAPPING,
      ...settings.fieldMapping,
    };
  }
  return DEFAULT_FIELD_MAPPING;
}

/**
 * Check if Google Calendar is configured (from either source).
 */
export async function isGoogleConfigured(): Promise<boolean> {
  try {
    await getGoogleConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if Notion is configured (from either source).
 */
export async function isNotionConfigured(): Promise<boolean> {
  try {
    await getNotionConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if both services are configured.
 */
export async function isFullyConfigured(): Promise<boolean> {
  const [google, notion] = await Promise.all([isGoogleConfigured(), isNotionConfigured()]);
  return google && notion;
}
