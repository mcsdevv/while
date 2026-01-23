import { z } from "zod";

const envSchema = z.object({
  // Notion (optional - can be configured via settings UI)
  NOTION_API_TOKEN: z.string().optional(),
  NOTION_DATABASE_ID: z.string().optional(),

  // Google Calendar (optional - can be configured via settings UI)
  GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional(),
  GOOGLE_CALENDAR_CALENDAR_ID: z.string().optional(),

  // Settings encryption (required for storing credentials in Redis)
  SETTINGS_ENCRYPTION_KEY: z.string().optional(),

  // Webhooks
  WEBHOOK_URL: z.string().url().optional(),
  ADMIN_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // NextAuth (optional at build time - validated at runtime when auth is used)
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTHORIZED_EMAILS: z
    .string()
    .optional()
    .transform((str) => str?.split(",").map((email) => email.trim())),

  // Optional
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

export const env = getEnv();

/**
 * Check if auth environment variables are configured.
 * Use this before requiring auth functionality.
 */
export function isAuthConfigured(): boolean {
  return Boolean(
    env.NEXTAUTH_SECRET &&
      env.AUTH_GOOGLE_ID &&
      env.AUTH_GOOGLE_SECRET &&
      env.AUTHORIZED_EMAILS?.length
  );
}

/**
 * Get required auth env var, throwing a helpful error if missing.
 * Call this at runtime when auth is actually needed.
 */
export function requireAuthEnv(): {
  NEXTAUTH_SECRET: string;
  AUTH_GOOGLE_ID: string;
  AUTH_GOOGLE_SECRET: string;
  AUTHORIZED_EMAILS: string[];
} {
  const missing: string[] = [];
  if (!env.NEXTAUTH_SECRET) missing.push("NEXTAUTH_SECRET");
  if (!env.AUTH_GOOGLE_ID) missing.push("AUTH_GOOGLE_ID");
  if (!env.AUTH_GOOGLE_SECRET) missing.push("AUTH_GOOGLE_SECRET");
  if (!env.AUTHORIZED_EMAILS?.length) missing.push("AUTHORIZED_EMAILS");

  if (missing.length > 0) {
    throw new Error(
      `Auth not configured. Missing environment variables: ${missing.join(", ")}. ` +
        "Please complete the setup wizard or set these variables in your environment."
    );
  }

  return {
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET!,
    AUTH_GOOGLE_ID: env.AUTH_GOOGLE_ID!,
    AUTH_GOOGLE_SECRET: env.AUTH_GOOGLE_SECRET!,
    AUTHORIZED_EMAILS: env.AUTHORIZED_EMAILS!,
  };
}
