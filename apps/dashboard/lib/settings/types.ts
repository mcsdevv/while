/**
 * Settings types for the Notion-GCal sync application.
 * These settings are stored encrypted in Redis and allow users
 * to configure the app via web UI instead of environment variables.
 */

export interface GoogleSettings {
  clientId: string;
  clientSecret: string; // Encrypted at rest
  refreshToken: string; // Encrypted at rest
  calendarId: string;
  connectedAt: string; // ISO timestamp
}

export interface NotionSettings {
  apiToken: string; // Encrypted at rest
  databaseId: string;
  databaseName?: string;
}

export interface FieldMapping {
  title: string;
  date: string;
  description: string;
  location: string;
  gcalEventId: string;
  reminders: string;
}

export interface AppSettings {
  google: GoogleSettings;
  notion: NotionSettings;
  fieldMapping: FieldMapping;
  setupCompleted: boolean;
}

/**
 * Default field mapping that matches the expected Notion database schema.
 * These are the property names used in the Notion database.
 */
export const DEFAULT_FIELD_MAPPING: FieldMapping = {
  title: "Title",
  date: "Date",
  description: "Description",
  location: "Location",
  gcalEventId: "GCal Event ID",
  reminders: "Reminders",
};

/**
 * Fields that contain sensitive data and must be encrypted at rest.
 */
export const ENCRYPTED_FIELDS = {
  google: ["clientSecret", "refreshToken"] as const,
  notion: ["apiToken"] as const,
};

export type EncryptedGoogleFields = (typeof ENCRYPTED_FIELDS.google)[number];
export type EncryptedNotionFields = (typeof ENCRYPTED_FIELDS.notion)[number];
