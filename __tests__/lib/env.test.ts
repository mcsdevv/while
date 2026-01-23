import { describe, expect, it } from "bun:test";
import { z } from "zod";

/**
 * Tests for environment variable validation schema
 */
describe("Environment Variables", () => {
  // Minimal schema for testing auth-related env vars
  const authEnvSchema = z.object({
    NEXTAUTH_SECRET: z.string().min(1, "NextAuth secret is required"),
    NEXTAUTH_URL: z.string().url().optional(),
    AUTH_GOOGLE_ID: z.string().min(1, "Google OAuth client ID is required"),
    AUTH_GOOGLE_SECRET: z.string().min(1, "Google OAuth client secret is required"),
    AUTHORIZED_EMAILS: z
      .string()
      .min(1, "At least one authorized email is required")
      .transform((str) => str.split(",").map((email) => email.trim())),
  });

  describe("NEXTAUTH_SECRET", () => {
    it("should require NEXTAUTH_SECRET", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid NEXTAUTH_SECRET", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "my-super-secret-key-that-is-32-chars",
        AUTH_GOOGLE_ID: "test.apps.googleusercontent.com",
        AUTH_GOOGLE_SECRET: "GOCSPX-test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("NEXTAUTH_URL", () => {
    it("should accept valid URL for NEXTAUTH_URL", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        NEXTAUTH_URL: "https://example.com",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should reject invalid URL for NEXTAUTH_URL", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        NEXTAUTH_URL: "not-a-url",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should allow NEXTAUTH_URL to be optional", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("AUTH_GOOGLE_ID", () => {
    it("should require AUTH_GOOGLE_ID", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid Google Client ID format", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "123456789-abc123.apps.googleusercontent.com",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("AUTH_GOOGLE_SECRET", () => {
    it("should require AUTH_GOOGLE_SECRET", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should accept valid Google Client Secret format", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "GOCSPX-abc123xyz789",
        AUTHORIZED_EMAILS: "test@example.com",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("AUTHORIZED_EMAILS", () => {
    it("should require at least one authorized email", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "",
      });

      expect(result.success).toBe(false);
    });

    it("should parse single email", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "user@example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.AUTHORIZED_EMAILS).toEqual(["user@example.com"]);
      }
    });

    it("should parse multiple emails separated by commas", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "user1@example.com,user2@example.com,user3@example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.AUTHORIZED_EMAILS).toEqual([
          "user1@example.com",
          "user2@example.com",
          "user3@example.com",
        ]);
      }
    });

    it("should trim whitespace from emails", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: " user1@example.com , user2@example.com , user3@example.com ",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.AUTHORIZED_EMAILS).toEqual([
          "user1@example.com",
          "user2@example.com",
          "user3@example.com",
        ]);
      }
    });

    it("should handle emails with no spaces", () => {
      const result = authEnvSchema.safeParse({
        NEXTAUTH_SECRET: "secret",
        AUTH_GOOGLE_ID: "test",
        AUTH_GOOGLE_SECRET: "test",
        AUTHORIZED_EMAILS: "user1@example.com,user2@example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.AUTHORIZED_EMAILS).toEqual(["user1@example.com", "user2@example.com"]);
      }
    });
  });

  describe("Complete Configuration", () => {
    it("should validate complete auth configuration", () => {
      const validConfig = {
        NEXTAUTH_SECRET: "my-super-secret-key-that-is-32-chars",
        NEXTAUTH_URL: "https://my-app.vercel.app",
        AUTH_GOOGLE_ID: "123456789-abc123.apps.googleusercontent.com",
        AUTH_GOOGLE_SECRET: "GOCSPX-abc123xyz789",
        AUTHORIZED_EMAILS: "admin@example.com,user@example.com",
      };

      const result = authEnvSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.NEXTAUTH_SECRET).toBe(validConfig.NEXTAUTH_SECRET);
        expect(result.data.NEXTAUTH_URL).toBe(validConfig.NEXTAUTH_URL);
        expect(result.data.AUTH_GOOGLE_ID).toBe(validConfig.AUTH_GOOGLE_ID);
        expect(result.data.AUTH_GOOGLE_SECRET).toBe(validConfig.AUTH_GOOGLE_SECRET);
        expect(result.data.AUTHORIZED_EMAILS).toEqual(["admin@example.com", "user@example.com"]);
      }
    });

    it("should reject invalid configuration", () => {
      const invalidConfig = {
        NEXTAUTH_SECRET: "", // Invalid: empty
        NEXTAUTH_URL: "not-a-url", // Invalid: not a URL
        AUTH_GOOGLE_ID: "", // Invalid: empty
        AUTH_GOOGLE_SECRET: "", // Invalid: empty
        AUTHORIZED_EMAILS: "", // Invalid: empty
      };

      const result = authEnvSchema.safeParse(invalidConfig);

      expect(result.success).toBe(false);
    });
  });
});
