/**
 * Backfill service for updating existing Notion pages with new field data from Google Calendar.
 * Stores progress in Redis for real-time tracking.
 */

import { getRedis } from "@/lib/redis";
import { fetchGcalEvents } from "@/lib/google-calendar/client";
import { updateNotionEvent } from "@/lib/notion/client";
import type { Event } from "@/lib/types";

const BACKFILL_KEY = "sync:backfill:progress";
const BATCH_SIZE = 100;

export interface BackfillProgress {
  status: "idle" | "running" | "completed" | "failed";
  total: number;
  processed: number;
  fieldsToBackfill: string[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

const DEFAULT_PROGRESS: BackfillProgress = {
  status: "idle",
  total: 0,
  processed: 0,
  fieldsToBackfill: [],
};

/**
 * Get current backfill progress from Redis
 */
export async function getBackfillProgress(): Promise<BackfillProgress> {
  const redis = getRedis();
  if (!redis) {
    return DEFAULT_PROGRESS;
  }
  const stored = await redis.get<BackfillProgress>(BACKFILL_KEY);
  return stored || DEFAULT_PROGRESS;
}

/**
 * Start a backfill operation for the specified fields.
 * Non-blocking - runs in background and updates progress in Redis.
 *
 * @param fields - Array of field names to backfill (e.g., ['attendees', 'organizer'])
 * @throws Error if Redis not configured or backfill already running
 */
export async function startBackfill(fields: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    throw new Error("Redis not configured");
  }

  // Check if already running
  const current = await getBackfillProgress();
  if (current.status === "running") {
    throw new Error("Backfill already in progress");
  }

  // Initialize progress
  await redis.set(BACKFILL_KEY, {
    status: "running",
    total: 0,
    processed: 0,
    fieldsToBackfill: fields,
    startedAt: new Date().toISOString(),
  });

  // Run backfill (non-blocking)
  runBackfill(fields).catch(async (error) => {
    console.error("Backfill failed:", error);
    const progress = await getBackfillProgress();
    const redisClient = getRedis();
    if (redisClient) {
      await redisClient.set(BACKFILL_KEY, {
        ...progress,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date().toISOString(),
      });
    }
  });
}

/**
 * Internal function that performs the actual backfill operation.
 * Fetches GCal events, filters to those with linked Notion pages,
 * and updates Notion with the requested fields.
 */
async function runBackfill(fields: string[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  // Fetch all GCal events (past 30 days + 1 year future)
  const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const timeMax = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const events = await fetchGcalEvents(timeMin, timeMax);

  // Filter to events with linked Notion pages
  const linkedEvents = events.filter((e) => e.notionPageId);
  const total = linkedEvents.length;

  // Update total
  let progress = await getBackfillProgress();
  await redis.set(BACKFILL_KEY, { ...progress, total });

  // Process in batches
  for (let i = 0; i < linkedEvents.length; i += BATCH_SIZE) {
    const batch = linkedEvents.slice(i, i + BATCH_SIZE);

    for (const event of batch) {
      if (!event.notionPageId || !event.gcalEventId) continue;

      try {
        // Build partial update with only requested fields
        const partialEvent: Partial<Event> = {};
        for (const field of fields) {
          if (field in event && event[field as keyof Event] !== undefined) {
            (partialEvent as Record<string, unknown>)[field] = event[field as keyof Event];
          }
        }

        // Update Notion page if there are fields to update
        if (Object.keys(partialEvent).length > 0) {
          await updateNotionEvent(event.notionPageId, partialEvent);
        }
      } catch (error) {
        console.error(`Failed to backfill event ${event.gcalEventId}:`, error);
        // Continue with next event - don't fail entire backfill
      }
    }

    // Update progress after each batch
    progress = await getBackfillProgress();
    await redis.set(BACKFILL_KEY, {
      ...progress,
      processed: Math.min(i + BATCH_SIZE, total),
    });
  }

  // Mark complete
  progress = await getBackfillProgress();
  await redis.set(BACKFILL_KEY, {
    ...progress,
    status: "completed",
    processed: total,
    completedAt: new Date().toISOString(),
  });
}

/**
 * Reset backfill progress to idle state.
 * Useful for clearing failed/completed state before starting a new backfill.
 */
export async function resetBackfillProgress(): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(BACKFILL_KEY, DEFAULT_PROGRESS);
}
