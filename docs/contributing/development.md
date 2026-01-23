# Development Guide

This guide covers setting up a local development environment.

## Prerequisites

- [Node.js](https://nodejs.org) 22+ (see [.nvmrc](../../.nvmrc))
- [pnpm](https://pnpm.io) 10+
- [Git](https://git-scm.com)
- A code editor (VS Code recommended)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/mcsdevv/notion-gcal-sync.git
cd notion-gcal-sync
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```bash
# Required for local development
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
SETTINGS_ENCRYPTION_KEY=your_32_byte_base64_key
AUTH_SECRET=your_auth_secret

# Optional - can configure via UI instead
NOTION_API_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxx
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REFRESH_TOKEN=xxx
```

### 4. Start Development Server

```bash
pnpm run dev
```

The app will be available at `http://localhost:3000`.

## Project Structure

```
notion-gcal-sync/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── webhooks/      # Webhook endpoints
│   │   ├── sync/          # Sync operations
│   │   ├── settings/      # Settings API
│   │   └── setup/         # Setup wizard API
│   ├── setup/             # Setup wizard pages
│   ├── settings/          # Settings pages
│   └── page.tsx           # Dashboard
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── dashboard/         # Dashboard components
│   ├── setup/             # Setup wizard components
│   └── settings/          # Settings components
├── lib/                    # Core libraries
│   ├── google-calendar/   # GCal API integration
│   ├── notion/            # Notion API integration
│   ├── sync/              # Sync logic
│   ├── settings/          # Settings management
│   └── utils/             # Utility functions
├── __tests__/             # Test files
├── docs/                   # Documentation
└── scripts/               # Helper scripts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start development server |
| `pnpm run build` | Build for production |
| `pnpm run start` | Start production server |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm run typecheck` | Type check TypeScript |
| `pnpm run lint` | Run linter |
| `pnpm run lint:fix` | Fix lint errors |
| `pnpm run format` | Format code |

## Code Style

The project uses [Biome](https://biomejs.dev) for linting and formatting.

### Auto-format on Save (VS Code)

Install the Biome extension and add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true
}
```

### Manual Formatting

```bash
pnpm run format
```

### Linting

```bash
pnpm run lint
pnpm run lint:fix  # Auto-fix issues
```

## TypeScript

The project uses strict TypeScript configuration.

### Type Checking

```bash
pnpm run typecheck
```

### Key Type Files

| File | Contents |
|------|----------|
| `lib/types/event.ts` | Internal event representation |
| `lib/settings/types.ts` | Settings interfaces |
| `lib/notion/types.ts` | Notion API types |
| `lib/google-calendar/types.ts` | GCal API types |

## Testing

See the [Testing Guide](testing.md) for detailed information.

Quick start:

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test __tests__/sync/core.test.ts

# Watch mode
pnpm test:watch
```

## API Development

### Adding a New Endpoint

1. Create file in `app/api/your-route/route.ts`
2. Export HTTP method handlers:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Hello' });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Handle POST
}
```

### Error Handling

Use consistent error responses:

```typescript
import { createErrorResponse } from '@/lib/api/errors';

if (!valid) {
  return createErrorResponse('Invalid input', 400);
}
```

## Working with External APIs

### Notion API

```typescript
import { notionClient } from '@/lib/notion/client';

const page = await notionClient.pages.retrieve({ page_id: 'xxx' });
```

### Google Calendar API

```typescript
import { getCalendarClient } from '@/lib/google-calendar/client';

const calendar = await getCalendarClient();
const events = await calendar.events.list({ calendarId: 'primary' });
```

## Environment Variables

### Adding New Variables

1. Add to `.env.example`
2. Add validation in `lib/env.ts`
3. Document in README

### Accessing Variables

```typescript
import { env } from '@/lib/env';

const token = env.NOTION_API_TOKEN;
```

## Debugging

### VS Code Launch Config

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Next.js",
      "skipFiles": ["<node_internals>/**"],
      "port": 9229
    }
  ]
}
```

Start with debugging:

```bash
NODE_OPTIONS='--inspect' pnpm run dev
```

### Console Logging

Use structured logging:

```typescript
console.log('[sync]', 'Processing event', { eventId, action });
```

## Git Workflow

### Branching

```
main          # Production-ready code
└── feature/* # Feature branches
└── fix/*     # Bug fix branches
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat: Add field mapping editor
fix: Handle null dates in Notion events
docs: Update setup guide
refactor: Extract sync utilities
test: Add webhook validation tests
```

### Pull Requests

1. Create feature branch from `main`
2. Make changes and commit
3. Push branch and open PR
4. Ensure CI passes
5. Request review
6. Squash and merge

## Troubleshooting

### "Cannot find module" errors

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Type errors after dependency update

```bash
pnpm run typecheck
```

### Redis connection issues

- Check Upstash credentials in `.env.local`
- Verify Upstash database is active
- Check network connectivity

### OAuth errors

- Verify redirect URIs include `http://localhost:3000`
- Check client ID and secret match
- Ensure Calendar API is enabled
