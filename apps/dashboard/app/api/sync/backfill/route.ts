import { getBackfillProgress, startBackfill } from "@/lib/sync/backfill";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const VALID_FIELDS = [
  "attendees",
  "organizer",
  "conferenceLink",
  "recurrence",
  "color",
  "visibility",
  "reminders",
] as const;

const startBackfillSchema = z.object({
  fields: z.array(z.enum(VALID_FIELDS)).min(1),
});

/**
 * GET /api/sync/backfill
 * Returns current backfill progress
 */
export async function GET() {
  try {
    const progress = await getBackfillProgress();
    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error fetching backfill progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/sync/backfill
 * Starts a backfill operation (non-blocking)
 *
 * Body: { fields: string[] }
 * Returns: { started: true, fieldsToBackfill: [...] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = startBackfillSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 },
      );
    }

    await startBackfill(parsed.data.fields);

    return NextResponse.json({
      started: true,
      fieldsToBackfill: parsed.data.fields,
    });
  } catch (error) {
    console.error("Error starting backfill:", error);

    if (error instanceof Error && error.message === "Backfill already in progress") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
