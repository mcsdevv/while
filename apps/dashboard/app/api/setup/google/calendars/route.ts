/**
 * Setup API - List Google Calendars
 * GET: List available calendars for selection
 * POST: Select a calendar to sync
 */

import { getGoogleClientConfig } from "@/lib/env";
import { resetGcalClient } from "@/lib/google-calendar/client";
import { getSettings, updateSettings } from "@/lib/settings";
import { calendar } from "@googleapis/calendar";
import { OAuth2Client } from "google-auth-library";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * GET - List available calendars
 */
export async function GET() {
  try {
    // Get client credentials from env vars
    const clientConfig = getGoogleClientConfig();
    if (!clientConfig) {
      return NextResponse.json(
        { error: "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET." },
        { status: 400 },
      );
    }

    // Get refresh token from settings
    const settings = await getSettings();
    if (!settings?.google?.refreshToken) {
      return NextResponse.json(
        { error: "Google not connected. Please sign in first." },
        { status: 400 },
      );
    }

    // Create OAuth2 client
    const oauth2Client = new OAuth2Client(clientConfig.clientId, clientConfig.clientSecret);
    oauth2Client.setCredentials({ refresh_token: settings.google.refreshToken });

    // Get calendar list
    const calendarClient = calendar({ version: "v3", auth: oauth2Client });
    const calendarList = await calendarClient.calendarList.list();

    const calendars = (calendarList.data.items || []).map((cal) => ({
      id: cal.id || "",
      name: cal.summary || "",
      primary: cal.primary || false,
      accessRole: cal.accessRole || "",
    }));

    return NextResponse.json({
      calendars,
      selectedCalendarId: settings.google.calendarId,
    });
  } catch (error) {
    console.error("Error listing calendars:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list calendars" },
      { status: 500 },
    );
  }
}

const selectCalendarSchema = z.object({
  calendarId: z.string().min(1, "Calendar ID is required"),
});

/**
 * POST - Select a calendar
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = selectCalendarSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.errors },
        { status: 400 },
      );
    }

    const settings = await getSettings();
    if (!settings?.google) {
      return NextResponse.json({ error: "Google not connected" }, { status: 400 });
    }

    await updateSettings({
      google: {
        ...settings.google,
        calendarId: result.data.calendarId,
      },
    });

    // Reset cached client so it picks up new calendar ID
    resetGcalClient();

    return NextResponse.json({
      status: "success",
      calendarId: result.data.calendarId,
    });
  } catch (error) {
    console.error("Error selecting calendar:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to select calendar" },
      { status: 500 },
    );
  }
}
