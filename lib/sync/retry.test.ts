import assert from "node:assert";
import { test } from "node:test";
import { NetworkError, RateLimitError, ValidationError, isRetryableError } from "@/lib/errors";
import { retryWithBackoff } from "./retry";

test("isRetryableError - identifies network errors", () => {
  const networkError = new NetworkError("Connection failed");
  assert.strictEqual(isRetryableError(networkError), true);

  const genericNetworkError = new Error("ECONNREFUSED");
  assert.strictEqual(isRetryableError(genericNetworkError), true);
});

test("isRetryableError - identifies rate limit errors", () => {
  const rateLimitError = new RateLimitError("Too many requests");
  assert.strictEqual(isRetryableError(rateLimitError), true);

  const genericRateLimitError = new Error("Rate limit exceeded");
  assert.strictEqual(isRetryableError(genericRateLimitError), true);
});

test("isRetryableError - identifies timeout errors", () => {
  const timeoutError = new Error("Connection timeout");
  assert.strictEqual(isRetryableError(timeoutError), true);

  const etimedoutError = new Error("ETIMEDOUT");
  assert.strictEqual(isRetryableError(etimedoutError), true);
});

test("isRetryableError - rejects non-retryable errors", () => {
  const validationError = new ValidationError("Invalid input");
  assert.strictEqual(isRetryableError(validationError), false);

  const genericValidationError = new Error("Invalid input");
  assert.strictEqual(isRetryableError(genericValidationError), false);
});

test("retryWithBackoff - succeeds on first try", async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    return "success";
  };

  const result = await retryWithBackoff(fn);
  assert.strictEqual(result, "success");
  assert.strictEqual(attempts, 1);
});

test("retryWithBackoff - retries on retryable error", async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    if (attempts < 3) {
      throw new Error("ECONNREFUSED");
    }
    return "success";
  };

  const result = await retryWithBackoff(fn, { maxRetries: 3, initialDelay: 10 });
  assert.strictEqual(result, "success");
  assert.strictEqual(attempts, 3);
});

test("retryWithBackoff - fails after max retries", async () => {
  const fn = async () => {
    throw new Error("ECONNREFUSED");
  };

  await assert.rejects(
    async () => {
      await retryWithBackoff(fn, { maxRetries: 2, initialDelay: 10 });
    },
    {
      message: "ECONNREFUSED",
    },
  );
});

test("retryWithBackoff - does not retry non-retryable errors", async () => {
  let attempts = 0;
  const fn = async () => {
    attempts++;
    throw new Error("Invalid input");
  };

  await assert.rejects(
    async () => {
      await retryWithBackoff(fn);
    },
    {
      message: "Invalid input",
    },
  );
  assert.strictEqual(attempts, 1);
});
