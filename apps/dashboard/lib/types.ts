import { z } from "zod";

// Shared event schema
export const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  location: z.string().optional(),
  status: z.enum(["confirmed", "tentative", "cancelled"]).optional(),
  reminders: z.number().optional(), // minutes before event
  // Sync metadata
  notionPageId: z.string().optional(),
  gcalEventId: z.string().optional(),
});

export type Event = z.infer<typeof eventSchema>;

// Sync operation types
export type SyncOperation = "create" | "update" | "delete";

export type SyncDirection = "notion_to_gcal" | "gcal_to_notion";

export interface SyncLog {
  id: string;
  timestamp: Date | string; // Date object or ISO string from Redis
  direction: SyncDirection;
  operation: SyncOperation;
  eventId: string;
  eventTitle: string;
  status: "success" | "failure";
  error?: string;
}

export interface SyncMetrics {
  lastSyncNotionToGcal: Date | string | null; // Date object or ISO string from Redis
  lastSyncGcalToNotion: Date | string | null; // Date object or ISO string from Redis
  totalSuccess: number;
  totalFailures: number;
  recentLogs: SyncLog[];
  operationCounts: {
    creates: number;
    updates: number;
    deletes: number;
  };
  apiQuota: {
    notion: {
      used: number;
    };
    googleCalendar: {
      used: number;
    };
  };
}
