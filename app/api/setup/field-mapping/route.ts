/**
 * Setup API - Field Mapping
 * GET: Get current field mapping
 * POST: Save field mapping configuration
 */

import { DEFAULT_FIELD_MAPPING, getSettings, updateSettings } from "@/lib/settings";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const fieldMappingSchema = z.object({
  title: z.string().min(1, "Title field is required"),
  date: z.string().min(1, "Date field is required"),
  description: z.string().optional().default(""),
  location: z.string().optional().default(""),
  gcalEventId: z.string().optional().default(""),
  reminders: z.string().optional().default(""),
});

/**
 * GET - Get current field mapping
 */
export async function GET() {
  try {
    const settings = await getSettings();

    return NextResponse.json({
      fieldMapping: settings?.fieldMapping || DEFAULT_FIELD_MAPPING,
      defaults: DEFAULT_FIELD_MAPPING,
    });
  } catch (error) {
    console.error("Error getting field mapping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get field mapping" },
      { status: 500 },
    );
  }
}

/**
 * POST - Save field mapping
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = fieldMappingSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    await updateSettings({
      fieldMapping: result.data,
    });

    return NextResponse.json({
      status: "success",
      fieldMapping: result.data,
    });
  } catch (error) {
    console.error("Error saving field mapping:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save field mapping" },
      { status: 500 },
    );
  }
}
