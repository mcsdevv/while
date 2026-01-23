/**
 * Validation tests
 *
 * Tests for Zod schemas and validation helper functions
 */

import { test } from "bun:test";
import assert from "node:assert";
import {
  authHeaderSchema,
  eventDataSchema,
  eventStatusSchema,
  gcalWebhookHeadersSchema,
  notionWebhookEventSchema,
  notionWebhookPayloadSchema,
  notionWebhookVerificationSchema,
  reminderSchema,
  sanitizeString,
  syncDirectionSchema,
  syncOperationSchema,
  validate,
  validateDateRange,
  validateEvent,
  validateSafe,
  webhookChannelSchema,
  webhookSetupRequestSchema,
} from "./validation";

// Google Calendar webhook headers validation
test("gcalWebhookHeadersSchema - validates valid headers", () => {
  const validHeaders = {
    "x-goog-resource-state": "exists",
    "x-goog-resource-id": "resource-123",
    "x-goog-channel-id": "channel-456",
    "x-goog-message-number": "1",
  };

  const result = gcalWebhookHeadersSchema.safeParse(validHeaders);
  assert.strictEqual(result.success, true);
});

test("gcalWebhookHeadersSchema - rejects invalid resource state", () => {
  const invalidHeaders = {
    "x-goog-resource-state": "invalid",
  };

  const result = gcalWebhookHeadersSchema.safeParse(invalidHeaders);
  assert.strictEqual(result.success, false);
});

// Notion webhook validation
test("notionWebhookVerificationSchema - validates verification payload", () => {
  const verification = {
    type: "verification",
    verification_token: "token-123",
  };

  const result = notionWebhookVerificationSchema.safeParse(verification);
  assert.strictEqual(result.success, true);
});

test("notionWebhookEventSchema - validates page.created event", () => {
  const event = {
    type: "page.created",
    entity: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  };

  const result = notionWebhookEventSchema.safeParse(event);
  assert.strictEqual(result.success, true);
});

test("notionWebhookEventSchema - rejects invalid UUID", () => {
  const event = {
    type: "page.created",
    entity: {
      id: "not-a-uuid",
    },
  };

  const result = notionWebhookEventSchema.safeParse(event);
  assert.strictEqual(result.success, false);
});

test("notionWebhookPayloadSchema - accepts verification or event", () => {
  const verification = {
    type: "verification",
    verification_token: "token-123",
  };

  const event = {
    type: "page.deleted",
    entity: {
      id: "123e4567-e89b-12d3-a456-426614174000",
    },
  };

  assert.strictEqual(notionWebhookPayloadSchema.safeParse(verification).success, true);
  assert.strictEqual(notionWebhookPayloadSchema.safeParse(event).success, true);
});

// Webhook setup validation
test("webhookSetupRequestSchema - validates optional URL", () => {
  const withUrl = { webhookUrl: "https://example.com/webhook" };
  const withoutUrl = {};

  assert.strictEqual(webhookSetupRequestSchema.safeParse(withUrl).success, true);
  assert.strictEqual(webhookSetupRequestSchema.safeParse(withoutUrl).success, true);
});

test("webhookSetupRequestSchema - rejects invalid URL", () => {
  const invalid = { webhookUrl: "not-a-url" };
  const result = webhookSetupRequestSchema.safeParse(invalid);
  assert.strictEqual(result.success, false);
});

// Authorization validation
test("authHeaderSchema - validates Bearer token", () => {
  const valid = "Bearer secret-token-123";
  const result = authHeaderSchema.safeParse(valid);
  assert.strictEqual(result.success, true);
});

test("authHeaderSchema - rejects invalid format", () => {
  const invalid = "Token secret-token-123";
  const result = authHeaderSchema.safeParse(invalid);
  assert.strictEqual(result.success, false);
});

// Event data validation
test("eventStatusSchema - validates event statuses", () => {
  assert.strictEqual(eventStatusSchema.safeParse("confirmed").success, true);
  assert.strictEqual(eventStatusSchema.safeParse("tentative").success, true);
  assert.strictEqual(eventStatusSchema.safeParse("cancelled").success, true);
  assert.strictEqual(eventStatusSchema.safeParse("invalid").success, false);
});

test("reminderSchema - validates reminder data", () => {
  const validReminder = {
    method: "email",
    minutes: 30,
  };

  const result = reminderSchema.safeParse(validReminder);
  assert.strictEqual(result.success, true);
});

test("reminderSchema - rejects out-of-range minutes", () => {
  const invalidReminder = {
    method: "popup",
    minutes: 50000, // Exceeds max 40320 (4 weeks)
  };

  const result = reminderSchema.safeParse(invalidReminder);
  assert.strictEqual(result.success, false);
});

test("eventDataSchema - validates complete event", () => {
  const event = {
    id: "event-123",
    title: "Team Meeting",
    description: "Quarterly planning session",
    startTime: new Date("2026-02-01T10:00:00Z"),
    endTime: new Date("2026-02-01T11:00:00Z"),
    location: "Conference Room A",
    status: "confirmed",
    reminders: [{ method: "email", minutes: 30 }],
    gcalEventId: "gcal-123",
    notionPageId: "123e4567-e89b-12d3-a456-426614174000",
  };

  const result = eventDataSchema.safeParse(event);
  assert.strictEqual(result.success, true);
});

test("eventDataSchema - requires title", () => {
  const event = {
    id: "event-123",
    title: "",
    startTime: new Date(),
    endTime: new Date(),
  };

  const result = eventDataSchema.safeParse(event);
  assert.strictEqual(result.success, false);
});

test("eventDataSchema - limits title length", () => {
  const event = {
    id: "event-123",
    title: "A".repeat(501), // Exceeds max 500
    startTime: new Date(),
    endTime: new Date(),
  };

  const result = eventDataSchema.safeParse(event);
  assert.strictEqual(result.success, false);
});

// Sync validation
test("syncDirectionSchema - validates sync directions", () => {
  assert.strictEqual(syncDirectionSchema.safeParse("notion_to_gcal").success, true);
  assert.strictEqual(syncDirectionSchema.safeParse("gcal_to_notion").success, true);
  assert.strictEqual(syncDirectionSchema.safeParse("bidirectional").success, true);
  assert.strictEqual(syncDirectionSchema.safeParse("invalid").success, false);
});

test("syncOperationSchema - validates operations", () => {
  assert.strictEqual(syncOperationSchema.safeParse("create").success, true);
  assert.strictEqual(syncOperationSchema.safeParse("update").success, true);
  assert.strictEqual(syncOperationSchema.safeParse("delete").success, true);
  assert.strictEqual(syncOperationSchema.safeParse("invalid").success, false);
});

// Webhook channel validation
test("webhookChannelSchema - validates channel metadata", () => {
  const channel = {
    channelId: "channel-123",
    resourceId: "resource-456",
    expiration: Date.now() + 86400000, // 24 hours from now
    calendarId: "calendar-789",
    createdAt: new Date(),
    lastRenewedAt: new Date(),
  };

  const result = webhookChannelSchema.safeParse(channel);
  assert.strictEqual(result.success, true);
});

test("webhookChannelSchema - rejects negative expiration", () => {
  const channel = {
    channelId: "channel-123",
    resourceId: "resource-456",
    expiration: -1000,
    calendarId: "calendar-789",
    createdAt: new Date(),
    lastRenewedAt: new Date(),
  };

  const result = webhookChannelSchema.safeParse(channel);
  assert.strictEqual(result.success, false);
});

// Helper function tests
test("validate - returns parsed data on success", () => {
  const data = { method: "email", minutes: 15 };
  const result = validate(reminderSchema, data);

  assert.strictEqual(result.method, "email");
  assert.strictEqual(result.minutes, 15);
});

test("validate - throws on validation error", () => {
  const data = { method: "invalid", minutes: 15 };

  assert.throws(
    () => validate(reminderSchema, data),
    (error: Error) => error.message.includes("Validation failed"),
  );
});

test("validateSafe - returns success result", () => {
  const data = { method: "popup", minutes: 60 };
  const result = validateSafe(reminderSchema, data);

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.method, "popup");
  }
});

test("validateSafe - returns error result", () => {
  const data = { method: "invalid", minutes: 60 };
  const result = validateSafe(reminderSchema, data);

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.ok(result.error.includes("Invalid enum value"));
  }
});

test("validateDateRange - validates end after start", () => {
  const start = new Date("2026-01-01T10:00:00Z");
  const end = new Date("2026-01-01T11:00:00Z");

  assert.strictEqual(validateDateRange(start, end), true);
});

test("validateDateRange - rejects end before start", () => {
  const start = new Date("2026-01-01T11:00:00Z");
  const end = new Date("2026-01-01T10:00:00Z");

  assert.strictEqual(validateDateRange(start, end), false);
});

test("validateEvent - accepts valid event", () => {
  const event = {
    id: "event-123",
    title: "Meeting",
    startTime: new Date("2026-01-01T10:00:00Z"),
    endTime: new Date("2026-01-01T11:00:00Z"),
  };

  const result = validateEvent(event);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.errors.length, 0);
});

test("validateEvent - rejects end before start", () => {
  const event = {
    id: "event-123",
    title: "Meeting",
    startTime: new Date("2026-01-01T11:00:00Z"),
    endTime: new Date("2026-01-01T10:00:00Z"),
  };

  const result = validateEvent(event);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("End time must be after start time")));
});

test("validateEvent - rejects events longer than 30 days", () => {
  const event = {
    id: "event-123",
    title: "Long Event",
    startTime: new Date("2026-01-01T00:00:00Z"),
    endTime: new Date("2026-02-15T00:00:00Z"), // 45 days
  };

  const result = validateEvent(event);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("cannot exceed 30 days")));
});

test("sanitizeString - trims and limits length", () => {
  const input = "  hello world  ";
  const result = sanitizeString(input, 5);

  assert.strictEqual(result, "hello");
});

test("sanitizeString - handles unicode correctly", () => {
  const input = "Hello 👋 World";
  const result = sanitizeString(input, 8);

  assert.ok(result.length <= 8);
});
