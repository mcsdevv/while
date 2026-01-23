/**
 * Setup API - Google Credentials
 * POST: Save Google OAuth client credentials (clientId, clientSecret)
 * GET: Get OAuth URL for user consent
 */

import { updateSettings } from "@/lib/settings";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const googleCredentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

/**
 * POST - Save Google OAuth credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = googleCredentialsSchema.safeParse(body);

    if (!result.success) {
      const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    const { clientId, clientSecret } = result.data;

    // Save credentials to settings (will be encrypted)
    await updateSettings({
      google: {
        clientId,
        clientSecret,
        refreshToken: "", // Will be set after OAuth callback
        calendarId: "", // Will be set after OAuth callback
        connectedAt: "",
      },
    });

    return NextResponse.json({
      status: "success",
      message: "Google credentials saved",
    });
  } catch (error) {
    console.error("Error saving Google credentials:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save credentials" },
      { status: 500 },
    );
  }
}

/**
 * GET - Generate OAuth URL for Google consent
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 });
    }

    // Build callback URL
    const host = request.headers.get("host");
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const callbackUrl = `${protocol}://${host}/api/setup/google/callback`;

    // Build Google OAuth URL
    const scopes = ["https://www.googleapis.com/auth/calendar"];
    const oauthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    oauthUrl.searchParams.set("client_id", clientId);
    oauthUrl.searchParams.set("redirect_uri", callbackUrl);
    oauthUrl.searchParams.set("response_type", "code");
    oauthUrl.searchParams.set("scope", scopes.join(" "));
    oauthUrl.searchParams.set("access_type", "offline");
    oauthUrl.searchParams.set("prompt", "consent"); // Force consent to get refresh token

    return NextResponse.json({
      oauthUrl: oauthUrl.toString(),
      callbackUrl,
    });
  } catch (error) {
    console.error("Error generating OAuth URL:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate OAuth URL" },
      { status: 500 },
    );
  }
}
