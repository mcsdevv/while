/**
 * Setup API - Google OAuth Callback
 * GET: Handle OAuth callback, exchange code for tokens, store in settings
 */

import { resetGcalClient } from "@/lib/google-calendar/client";
import { getSettings, updateSettings } from "@/lib/settings";
import { google } from "googleapis";
import { type NextRequest, NextResponse } from "next/server";

/**
 * GET - OAuth callback handler
 * Exchanges auth code for refresh token and stores in settings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle errors from Google
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/setup?error=${encodeURIComponent(error)}`, request.url),
      );
    }

    if (!code) {
      return NextResponse.redirect(new URL("/setup?error=no_code", request.url));
    }

    // Get stored credentials
    const settings = await getSettings();
    if (!settings?.google?.clientId || !settings?.google?.clientSecret) {
      return NextResponse.redirect(new URL("/setup?error=missing_credentials", request.url));
    }

    // Build callback URL (must match what was used in the OAuth request)
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const callbackUrl = `${protocol}://${host}/api/setup/google/callback`;

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      settings.google.clientId,
      settings.google.clientSecret,
      callbackUrl,
    );

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("No refresh token received");
      return NextResponse.redirect(new URL("/setup?error=no_refresh_token", request.url));
    }

    // Get list of calendars to let user choose
    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const calendarList = await calendar.calendarList.list();

    // Find primary calendar or first one
    const primaryCalendar = calendarList.data.items?.find((cal) => cal.primary);
    const defaultCalendarId = primaryCalendar?.id || calendarList.data.items?.[0]?.id || "";

    // Update settings with refresh token and calendar ID
    await updateSettings({
      google: {
        ...settings.google,
        refreshToken: tokens.refresh_token,
        calendarId: defaultCalendarId,
        connectedAt: new Date().toISOString(),
      },
    });

    // Reset cached client so it picks up new credentials
    resetGcalClient();

    // Redirect back to setup with success
    return NextResponse.redirect(new URL("/setup?google=connected", request.url));
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    const errorMessage = error instanceof Error ? error.message : "oauth_failed";
    return NextResponse.redirect(
      new URL(`/setup?error=${encodeURIComponent(errorMessage)}`, request.url),
    );
  }
}
