/**
 * Setup API - Status
 * GET: Get current setup status
 */

import { getSettings, isSetupComplete } from "@/lib/settings";
import { NextResponse } from "next/server";

/**
 * GET - Get setup status
 */
export async function GET() {
  try {
    const settings = await getSettings();
    const setupComplete = await isSetupComplete();

    return NextResponse.json({
      setupComplete,
      google: {
        configured: !!(settings?.google?.clientId && settings?.google?.clientSecret),
        connected: !!settings?.google?.refreshToken,
        calendarSelected: !!settings?.google?.calendarId,
        connectedAt: settings?.google?.connectedAt || null,
      },
      notion: {
        configured: !!settings?.notion?.apiToken,
        databaseSelected: !!settings?.notion?.databaseId,
        databaseName: settings?.notion?.databaseName || null,
      },
      fieldMapping: {
        configured: !!settings?.fieldMapping,
      },
    });
  } catch (error) {
    console.error("Error getting setup status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 },
    );
  }
}
