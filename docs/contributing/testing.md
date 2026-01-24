# Testing Guide

This guide covers the testing strategy and how to write and run tests.

## Overview

The project uses [Vitest](https://vitest.dev/) as the test runner with a focus on:

- Unit tests for transformation and utility functions
- Integration tests for API routes
- Mock-based tests for external API calls

## Running Tests

### All Tests

```bash
pnpm test
```

### Watch Mode

```bash
pnpm test:watch
```

### Specific File

```bash
pnpm test __tests__/sync/core.test.ts
```

### Pattern Matching

```bash
pnpm test --filter "notion transform"
```

### Coverage

```bash
pnpm test:coverage
```

## Test Structure

```
__tests__/
├── sync/
│   ├── core.test.ts           # Core sync logic
│   ├── loop-prevention.test.ts # Loop prevention
│   └── conflict.test.ts        # Conflict resolution
├── google-calendar/
│   ├── transform.test.ts       # Event transformations
│   ├── events.test.ts          # Event operations
│   └── webhook.test.ts         # Webhook handling
├── notion/
│   ├── transform.test.ts       # Page transformations
│   ├── database.test.ts        # Database operations
│   └── config.test.ts          # Field mapping
├── settings/
│   ├── storage.test.ts         # Redis operations
│   └── encryption.test.ts      # Crypto utilities
├── api/
│   ├── webhooks.test.ts        # Webhook endpoints
│   ├── sync.test.ts            # Sync endpoints
│   └── settings.test.ts        # Settings endpoints
└── utils/
    ├── timezone.test.ts        # Timezone utilities
    └── retry.test.ts           # Retry logic
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, test, expect, beforeEach, vi } from 'vitest';

describe('MyFunction', () => {
  beforeEach(() => {
    // Setup before each test
  });

  test('should handle valid input', () => {
    const result = myFunction('valid');
    expect(result).toBe('expected');
  });

  test('should throw on invalid input', () => {
    expect(() => myFunction(null)).toThrow('Invalid input');
  });
});
```

### Async Tests

```typescript
test('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toHaveProperty('id');
});
```

### Mocking

```typescript
import { vi } from 'vitest';

const mockFetch = vi.fn(() => Promise.resolve({ ok: true }));

test('should call API', async () => {
  await callApi();
  expect(mockFetch).toHaveBeenCalledTimes(1);
});
```

## Test Categories

### Unit Tests

Test individual functions in isolation.

```typescript
// __tests__/notion/transform.test.ts
import { notionPageToEvent } from '@/lib/notion/transform';

describe('notionPageToEvent', () => {
  test('transforms page with all fields', () => {
    const page = createMockNotionPage({
      title: 'Meeting',
      date: { start: '2024-01-15T10:00:00Z', end: '2024-01-15T11:00:00Z' },
      description: 'Team standup',
      location: 'Room 101',
    });

    const event = notionPageToEvent(page, fieldMapping);

    expect(event).toEqual({
      title: 'Meeting',
      start: new Date('2024-01-15T10:00:00Z'),
      end: new Date('2024-01-15T11:00:00Z'),
      description: 'Team standup',
      location: 'Room 101',
      sourceId: page.id,
      source: 'notion',
    });
  });

  test('handles missing optional fields', () => {
    const page = createMockNotionPage({
      title: 'Quick call',
      date: { start: '2024-01-15T10:00:00Z' },
    });

    const event = notionPageToEvent(page, fieldMapping);

    expect(event.description).toBeUndefined();
    expect(event.location).toBeUndefined();
  });
});
```

### Integration Tests

Test API routes with mocked external services.

```typescript
// __tests__/api/webhooks.test.ts
import { POST } from '@/app/api/webhooks/google-calendar/route';
import { NextRequest } from 'next/server';

describe('Google Calendar Webhook', () => {
  test('processes valid notification', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/google-calendar', {
      method: 'POST',
      headers: {
        'X-Goog-Channel-ID': 'test-channel',
        'X-Goog-Resource-State': 'sync',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
  });

  test('rejects invalid channel', async () => {
    const request = new NextRequest('http://localhost/api/webhooks/google-calendar', {
      method: 'POST',
      headers: {
        'X-Goog-Channel-ID': 'invalid-channel',
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
```

### Mock Utilities

The project includes mock factories for common objects.

```typescript
// __tests__/mocks/notion.ts
export function createMockNotionPage(overrides = {}) {
  return {
    id: 'page-123',
    object: 'page',
    created_time: '2024-01-01T00:00:00Z',
    last_edited_time: '2024-01-01T00:00:00Z',
    properties: {
      Title: { title: [{ text: { content: 'Test Event' } }] },
      Date: { date: { start: '2024-01-15', end: '2024-01-15' } },
      ...overrides,
    },
  };
}

// __tests__/mocks/gcal.ts
export function createMockGCalEvent(overrides = {}) {
  return {
    id: 'event-456',
    summary: 'Test Event',
    start: { dateTime: '2024-01-15T10:00:00Z' },
    end: { dateTime: '2024-01-15T11:00:00Z' },
    ...overrides,
  };
}
```

## Testing Patterns

### Testing Transformations

```typescript
describe('Event Transformations', () => {
  const testCases = [
    {
      name: 'all-day event',
      input: { date: { start: '2024-01-15' } },
      expected: { allDay: true },
    },
    {
      name: 'timed event',
      input: { date: { start: '2024-01-15T10:00:00Z' } },
      expected: { allDay: false },
    },
  ];

  testCases.forEach(({ name, input, expected }) => {
    test(`handles ${name}`, () => {
      const result = transform(input);
      expect(result).toMatchObject(expected);
    });
  });
});
```

### Testing Error Handling

```typescript
describe('Error Handling', () => {
  test('retries on network error', async () => {
    const mockFetch = vi.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true });

    await fetchWithRetry(mockFetch);

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('gives up after max retries', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(fetchWithRetry(mockFetch)).rejects.toThrow('Network error');
    expect(mockFetch).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });
});
```

### Testing with Environment Variables

```typescript
import { withEnv } from '@/tests/utils/env';

describe('Settings', () => {
  test('uses env vars when settings empty', async () => {
    await withEnv(
      {
        NOTION_API_TOKEN: 'env-token',
      },
      async () => {
        const token = await getNotionToken();
        expect(token).toBe('env-token');
      }
    );
  });
});
```

## Test Data

### Fixtures

Store test data in `__tests__/fixtures/`:

```typescript
// __tests__/fixtures/events.ts
export const sampleNotionPage = {
  id: 'page-123',
  // ... complete page object
};

export const sampleGCalEvent = {
  id: 'event-456',
  // ... complete event object
};
```

### Factories

Use factories for dynamic test data:

```typescript
let eventCounter = 0;

export function createEvent(overrides = {}) {
  eventCounter++;
  return {
    id: `event-${eventCounter}`,
    title: `Event ${eventCounter}`,
    start: new Date(),
    ...overrides,
  };
}
```

## Coverage Requirements

Target coverage: **80%+**

Focus areas:
- Sync core logic: **90%+**
- Transformations: **95%+**
- Error handling: **85%+**
- API routes: **80%+**

## CI Integration

Tests run automatically on:
- Push to any branch
- Pull request creation
- Pull request updates

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: pnpm test
```

## Debugging Tests

### Verbose Output

```bash
pnpm test -- --reporter=verbose
```

### Single Test

```bash
pnpm test -t "specific test name"
```

### Debug Mode

Add `debugger` statement and run:

```bash
node --inspect-brk ./node_modules/.bin/vitest
```

Then attach VS Code debugger.

## Best Practices

1. **Test behavior, not implementation** - Focus on inputs/outputs
2. **Keep tests independent** - No shared state between tests
3. **Use descriptive names** - `test('should return empty array when no events found')`
4. **One assertion per test** - When practical
5. **Test edge cases** - Null, empty, boundaries
6. **Mock external services** - Never call real APIs in tests
