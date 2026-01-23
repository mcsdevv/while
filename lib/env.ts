import { z } from "zod";

const envSchema = z.object({
  // Notion
  NOTION_API_TOKEN: z.string().min(1, "Notion API token is required"),
  NOTION_DATABASE_ID: z.string().min(1, "Notion database ID is required"),

  // Google Calendar
  GOOGLE_CALENDAR_CLIENT_ID: z.string().min(1, "Google Calendar client ID is required"),
  GOOGLE_CALENDAR_CLIENT_SECRET: z.string().min(1, "Google Calendar client secret is required"),
  GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().min(1, "Google Calendar refresh token is required"),
  GOOGLE_CALENDAR_CALENDAR_ID: z.string().default("primary"),

  // Webhooks
  WEBHOOK_URL: z.string().url().optional(),
  ADMIN_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(1, "NextAuth secret is required"),
  NEXTAUTH_URL: z.string().url().optional(),
  AUTH_GOOGLE_ID: z.string().min(1, "Google OAuth client ID is required"),
  AUTH_GOOGLE_SECRET: z.string().min(1, "Google OAuth client secret is required"),
  AUTHORIZED_EMAILS: z
    .string()
    .min(1, "At least one authorized email is required")
    .transform((str) => str.split(",").map((email) => email.trim())),

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
