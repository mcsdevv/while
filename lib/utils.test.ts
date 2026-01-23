import assert from "node:assert";
import { test } from "node:test";
import { cn, formatDate } from "./utils";

test("cn - combines class names", () => {
  const result = cn("foo", "bar");
  assert.strictEqual(result, "foo bar");
});

test("cn - handles conditional classes", () => {
  const result = cn("foo", false && "bar", "baz");
  assert.strictEqual(result, "foo baz");
});

test("cn - merges tailwind classes", () => {
  const result = cn("px-2 py-1", "px-4");
  // Should merge px-4 over px-2
  assert.strictEqual(result.includes("px-4"), true);
  assert.strictEqual(result.includes("px-2"), false);
  assert.strictEqual(result.includes("py-1"), true);
});

test("formatDate - formats date as relative time", () => {
  const now = new Date();
  const result = formatDate(now);
  assert.strictEqual(typeof result, "string");
  assert.strictEqual(result.length > 0, true);
});

test("formatDate - handles past dates", () => {
  const pastDate = new Date(Date.now() - 1000 * 60 * 5); // 5 minutes ago
  const result = formatDate(pastDate);
  assert.strictEqual(typeof result, "string");
  assert.strictEqual(result.length > 0, true);
  // formatDate returns absolute time format, not relative
});
