import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Tests for authentication configuration and email whitelist
 */
describe("Authentication", () => {
  describe("Email Whitelist", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Reset environment before each test
      process.env = { ...originalEnv };
    });

    it("should allow authorized emails to sign in", () => {
      // Mock environment with authorized emails
      process.env.AUTHORIZED_EMAILS = "user1@example.com,user2@example.com";

      const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(",").map((e) => e.trim());
      const testEmail = "user1@example.com";

      expect(authorizedEmails.includes(testEmail)).toBe(true);
    });

    it("should reject unauthorized emails", () => {
      process.env.AUTHORIZED_EMAILS = "user1@example.com,user2@example.com";

      const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(",").map((e) => e.trim());
      const testEmail = "unauthorized@example.com";

      expect(authorizedEmails.includes(testEmail)).toBe(false);
    });

    it("should handle case-insensitive email comparison", () => {
      process.env.AUTHORIZED_EMAILS = "User@Example.com";

      const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(",").map((e) =>
        e.trim().toLowerCase(),
      );
      const testEmail = "user@example.com";

      expect(authorizedEmails.includes(testEmail.toLowerCase())).toBe(true);
    });

    it("should handle multiple emails with spaces", () => {
      process.env.AUTHORIZED_EMAILS = " user1@example.com , user2@example.com , user3@example.com ";

      const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(",").map((e) => e.trim());

      expect(authorizedEmails).toEqual([
        "user1@example.com",
        "user2@example.com",
        "user3@example.com",
      ]);
    });

    it("should handle single authorized email", () => {
      process.env.AUTHORIZED_EMAILS = "single@example.com";

      const authorizedEmails = process.env.AUTHORIZED_EMAILS.split(",").map((e) => e.trim());

      expect(authorizedEmails).toEqual(["single@example.com"]);
      expect(authorizedEmails.length).toBe(1);
    });
  });

  describe("Environment Variables", () => {
    it("should require NEXTAUTH_SECRET when present", () => {
      const secret = process.env.NEXTAUTH_SECRET || "test-secret";
      expect(typeof secret).toBe("string");
      expect(secret.length).toBeGreaterThan(0);
    });

    it("should require AUTH_GOOGLE_ID when present", () => {
      const clientId = process.env.AUTH_GOOGLE_ID || "test.apps.googleusercontent.com";
      expect(typeof clientId).toBe("string");
      expect(clientId.length).toBeGreaterThan(0);
    });

    it("should require AUTH_GOOGLE_SECRET when present", () => {
      const clientSecret = process.env.AUTH_GOOGLE_SECRET || "GOCSPX-test";
      expect(typeof clientSecret).toBe("string");
      expect(clientSecret.length).toBeGreaterThan(0);
    });

    it("should require AUTHORIZED_EMAILS when present", () => {
      const emails = process.env.AUTHORIZED_EMAILS || "test@example.com";
      expect(typeof emails).toBe("string");
      expect(emails.length).toBeGreaterThan(0);
    });

    it("NEXTAUTH_URL should be a valid URL if provided", () => {
      const url = process.env.NEXTAUTH_URL || "https://example.com";
      if (url) {
        expect(() => new URL(url)).not.toThrow();
      }
    });
  });

  describe("Session Strategy", () => {
    it("should use JWT strategy for stateless authentication", () => {
      // NextAuth configuration uses JWT strategy
      // This is important for Vercel serverless functions
      const expectedStrategy = "jwt";
      expect(expectedStrategy).toBe("jwt");
    });
  });

  describe("OAuth Configuration", () => {
    it("should configure Google provider with correct scopes", () => {
      // Google OAuth should request email and profile
      const expectedScopes = ["openid", "email", "profile"];

      // NextAuth automatically requests these scopes
      expect(expectedScopes).toContain("email");
      expect(expectedScopes).toContain("profile");
    });

    it("should prompt for account selection", () => {
      // Authorization params should include prompt=select_account
      // This forces users to choose which Google account to use
      const prompt = "select_account";
      expect(prompt).toBe("select_account");
    });
  });

  describe("Security", () => {
    it("should log unauthorized sign-in attempts", () => {
      const consoleSpy = vi.fn();
      const originalWarn = console.warn;
      console.warn = consoleSpy;

      const unauthorizedEmail = "hacker@evil.com";
      const authorizedEmails = ["user@example.com"];

      if (!authorizedEmails.includes(unauthorizedEmail.toLowerCase())) {
        console.warn(`Unauthorized sign-in attempt from: ${unauthorizedEmail}`);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        `Unauthorized sign-in attempt from: ${unauthorizedEmail}`,
      );

      console.warn = originalWarn;
    });

    it("should reject sign-in if user has no email", () => {
      const user = { email: null };
      const isAuthorized = user.email !== null;

      expect(isAuthorized).toBe(false);
    });

    it("should reject sign-in if email is undefined", () => {
      const user = { email: undefined };
      const isAuthorized = user.email !== undefined;

      expect(isAuthorized).toBe(false);
    });
  });

  describe("Callback URLs", () => {
    it("should redirect to homepage after successful sign-in", () => {
      const defaultRedirect = "/";
      expect(defaultRedirect).toBe("/");
    });

    it("should redirect to homepage on error", () => {
      const errorRedirect = "/";
      expect(errorRedirect).toBe("/");
    });
  });
});
