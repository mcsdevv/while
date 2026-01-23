# Architecture Overview

This document describes the technical architecture of Notion-Google Calendar Sync.

## System Overview

```
┌─────────────────┐     Webhook      ┌──────────────────┐
│  Google Calendar │ ───────────────→ │                  │
│                 │ ←─────────────── │   Next.js App    │
└─────────────────┘     API Calls    │   (Vercel)       │
                                      │                  │
┌─────────────────┐     Polling      │  ┌────────────┐  │
│     Notion      │ ←─────────────── │  │ Sync Core  │  │
│                 │ ───────────────→ │  └────────────┘  │
└─────────────────┘     API Calls    │                  │
                                      │  ┌────────────┐  │
                                      │  │  Settings  │  │
┌─────────────────┐                   │  │  Storage   │  │
│  Upstash Redis  │ ←───────────────→ │  └────────────┘  │
└─────────────────┘   Read/Write      └──────────────────┘
```

## Key Components

### Sync Core (`lib/sync/`)

Handles bidirectional event synchronization.

| File | Purpose |
|------|---------|
| `core.ts` | Main sync orchestration |
| `notion-to-gcal.ts` | Notion → Google Calendar sync |
| `gcal-to-notion.ts` | Google Calendar → Notion sync |
| `loop-prevention.ts` | Prevents infinite sync loops |
| `conflict-resolution.ts` | Handles simultaneous edits |

### API Clients

#### Google Calendar (`lib/google-calendar/`)

| File | Purpose |
|------|---------|
| `client.ts` | OAuth client initialization |
| `events.ts` | Event CRUD operations |
| `webhook.ts` | Push notification handling |
| `transform.ts` | Event ↔ internal format conversion |

#### Notion (`lib/notion/`)

| File | Purpose |
|------|---------|
| `client.ts` | Notion SDK wrapper |
| `database.ts` | Database query operations |
| `pages.ts` | Page CRUD operations |
| `config.ts` | Field mapping configuration |
| `transform.ts` | Page ↔ internal format conversion |

### Settings (`lib/settings/`)

Encrypted credential storage.

| File | Purpose |
|------|---------|
| `types.ts` | TypeScript interfaces |
| `storage.ts` | Redis read/write |
| `encryption.ts` | AES-256-GCM utilities |
| `loader.ts` | Unified config loader |

## Data Flow

### Notion → Google Calendar

```
1. Vercel Cron triggers polling (every 2 minutes)
2. Fetch recently modified Notion pages
3. For each modified page:
   a. Check if page has gcal_event_id
   b. If yes: Update existing GCal event
   c. If no: Create new GCal event, store ID in Notion
4. Log results to Redis
```

### Google Calendar → Notion

```
1. GCal push notification hits /api/webhooks/google-calendar
2. Fetch changed events from GCal
3. For each changed event:
   a. Check if event has notion_page_id in extended properties
   b. If yes: Update existing Notion page
   c. If no: Create new Notion page, store ID in GCal event
4. Log results to Redis
```

## Loop Prevention

The sync uses embedded IDs to prevent infinite loops:

| Source | Stored In | Property |
|--------|-----------|----------|
| GCal event ID | Notion page | `gcal_event_id` (text property) |
| Notion page ID | GCal event | `extendedProperties.private.notion_page_id` |

When processing a webhook/poll:
1. Check if the change originated from the other system (via stored ID)
2. If so, skip to prevent loop
3. If not, process and store the cross-reference ID

## Conflict Resolution

When both systems are modified simultaneously:

```
Google Calendar wins
```

Implementation:
- Comparison by `updatedAt` timestamp
- If within 5-second window: GCal takes precedence
- If outside window: Latest change wins

## Data Mapping

### Event Fields

| Internal Field | Notion Property | GCal Field |
|----------------|-----------------|------------|
| `title` | Title (configurable) | `summary` |
| `start` | Date start | `start.dateTime` |
| `end` | Date end | `end.dateTime` |
| `description` | Description (configurable) | `description` |
| `location` | Location (configurable) | `location` |
| `reminders` | Reminders (configurable) | `reminders.overrides` |

### Timezone Handling

- All times stored as UTC internally
- Notion: Uses ISO 8601 with timezone
- GCal: Uses RFC 3339 format
- Display: Converted to user's local timezone in UI

## API Routes

### Webhooks

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/webhooks/google-calendar` | POST | Receive GCal push notifications |
| `/api/webhooks/google-calendar` | GET | Webhook verification |

### Sync Operations

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/sync/manual` | POST | Trigger manual sync |
| `/api/sync/notion-poll` | POST | Cron-triggered Notion poll |

### Settings

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/settings` | GET/PUT | Read/update all settings |
| `/api/settings/field-mapping` | GET/PUT | Field mapping only |
| `/api/settings/test` | POST | Test connections |

### Setup Wizard

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/setup/google-oauth` | POST | Start OAuth flow |
| `/api/setup/google-oauth/callback` | GET | OAuth callback |
| `/api/setup/notion/validate` | POST | Validate Notion token |
| `/api/setup/notion/databases` | GET | List accessible databases |
| `/api/setup/test-connections` | POST | Test all connections |

## Storage

### Redis (Upstash)

Stores encrypted settings and sync state.

| Key | Purpose |
|-----|---------|
| `settings` | Encrypted app configuration |
| `sync:logs` | Recent sync operation logs |
| `sync:metrics` | Success/failure counts |
| `webhook:channel` | GCal webhook channel info |

### Encryption

- Algorithm: AES-256-GCM
- Key derivation: HKDF from `SETTINGS_ENCRYPTION_KEY`
- Encrypted fields: OAuth secrets, API tokens

## Error Handling

### Retry Strategy

```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 second delay
Attempt 4: 4 second delay
If all fail: Log error, increment metrics
```

### Error Categories

| Category | Handling |
|----------|----------|
| Rate limit | Respect Retry-After header |
| Network error | Retry with backoff |
| Auth failure | Log, require manual intervention |
| Invalid data | Log, skip event |

## Security

### Authentication
- Dashboard: NextAuth.js with Google OAuth
- API: Bearer token or session cookie
- Webhooks: Signature verification

### Data Protection
- Credentials encrypted at rest
- HTTPS for all communications
- No PII in logs
- Tokens never exposed in UI

## Performance

### Caching
- Settings cached for 5 minutes
- Event data not cached (always fresh)

### Timeouts
- API calls: 30 seconds
- Webhook processing: 10 seconds
- Sync operations: 60 seconds

### Rate Limits
- Notion: 3 requests/second
- GCal: 10 requests/second (per calendar)
