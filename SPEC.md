# Notion-Google Calendar Sync - Project Specification

## Project Overview

A personal data synchronization tool that maintains bidirectional, real-time sync between a Notion calendar database and Google Calendar. Built as a Next.js application deployed to Vercel with a dashboard for monitoring and debugging.

### Core Problem
Keeping calendar events synchronized across Notion and Google Calendar without manual copying or duplicate entries.

### Target Users
Personal use (single user)

### Deployment Model
One-time build with ongoing maintenance as needed. Deployed to Vercel with minimal infrastructure overhead.

---

## Architecture

### Platform
- **Framework**: Next.js (App Router or Pages Router)
- **Hosting**: Vercel
- **Language**: TypeScript
- **Testing**: Jest or Vitest
- **UI Components**: shadcn/ui with Tailwind CSS

### Data Storage Strategy
**Stateless approach using embedded IDs:**
- **Notion**: Add a text property `gcal_event_id` to the calendar database to store Google Calendar event IDs
- **Google Calendar**: Use `extendedProperties.private.notion_page_id` to store Notion page IDs
- **No external database required**

**Rationale**: For a personal tool, embedding sync metadata in the events themselves avoids database complexity while maintaining reliable event mapping.

**Tradeoffs:**
- ✅ Simple architecture, no database to maintain
- ✅ State survives restarts automatically
- ❌ Sync metadata visible in data models
- ❌ No historical sync audit trail
- ❌ Limited bulk operations support

---

## Sync Behavior

### Sync Direction
**Bidirectional**: Changes in either system propagate to the other

### Conflict Resolution
**Google Calendar wins**: When the same event is modified simultaneously in both systems, Google Calendar changes take precedence

### Trigger Mechanism
**Real-time webhook-driven**:
- Notion webhook endpoint receives changes from Notion
- Google Calendar push notifications receive changes from Google Calendar
- No polling or scheduled jobs (initially)

### Initial Deployment
**Start fresh**: Only sync events created after deployment. No backfill of existing events.

---

## Data Mapping

### Event Fields to Sync

| Field | Notion → GCal | GCal → Notion | Notes |
|-------|---------------|---------------|-------|
| Title/Name | ✓ | ✓ | Event title |
| Start Time | ✓ | ✓ | Stored as UTC |
| End Time | ✓ | ✓ | Stored as UTC |
| Description | ✓ | ✓ | Event notes/details |
| Location | ✓ | ✓ | Physical or virtual location |
| Color/Status | ✓ | ✓ | Visual indicators or categories |
| Reminders | ✓ | ✓ | Notification settings |
| GCal Event ID | - | ✓ | Stored in Notion property |
| Notion Page ID | ✓ | - | Stored in GCal extended properties |

### Timezone Handling
**Store as UTC**: All timestamps converted to UTC for consistency. Display in user's local timezone in UI.

### Event Scope
**All events (past and future)**: The system syncs modifications to any event regardless of its date

---

## Special Cases

### Recurring Events
**Treat each instance as a separate event**:
- Each occurrence of a recurring event in Google Calendar is synced as an individual event in Notion
- No recurrence pattern synchronization
- Simplifies Notion integration (limited recurrence support)

### Event Deletions
**Bidirectional automatic deletion**:
- Deleting an event in Google Calendar deletes the corresponding Notion page
- Deleting a Notion calendar entry deletes the corresponding Google Calendar event
- No soft-delete or archival

### Multiple Calendars
**Initial**: Single Google Calendar ↔ Single Notion Database
**Future extensibility**: Support multiple Google Calendars syncing to the same Notion database
- Design API structure to accommodate calendar routing
- Store calendar identifier in Notion for reverse mapping

---

## Error Handling & Reliability

### Error Response Strategy
1. **Log and continue**: Record errors but don't halt other sync operations
2. **Retry with exponential backoff**: 3 retry attempts with delays (1s, 2s, 4s)
3. **Alert via metrics**: Display error counts and trends in dashboard

### Retry Logic
**Simple exponential backoff**:
```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 second delay
Attempt 4: 4 second delay
If all fail: Log and increment error metrics
```

### API Failure Scenarios
- **Rate limiting**: Respect rate limits, retry after appropriate delay
- **Network errors**: Retry with backoff
- **Authentication failures**: Log prominently in dashboard, require manual token refresh
- **Invalid data**: Log details and skip the problematic event

---

## Authentication

### OAuth Strategy
**Manual token management via environment variables**:
- Manually obtain OAuth tokens for both Notion and Google Calendar
- Store as Vercel environment variables:
  - `NOTION_API_TOKEN`
  - `GOOGLE_CALENDAR_CLIENT_ID`
  - `GOOGLE_CALENDAR_CLIENT_SECRET`
  - `GOOGLE_CALENDAR_REFRESH_TOKEN`

### Token Refresh
- Implement automatic token refresh for Google Calendar OAuth
- Notion uses integration tokens (no refresh needed)

---

## Dashboard & Monitoring

### Dashboard Features

#### 1. Status Overview
- Current sync status (healthy/errors)
- Last successful sync timestamps (Notion → GCal, GCal → Notion)
- Connection status for both APIs

#### 2. Metrics
- **Sync success/failure counts**: Total and recent (last 24h, 7d)
- **Event operation types**: Creates, updates, deletes (breakdown by direction)
- **Last sync timestamps**: When each direction last synced successfully
- **API quota usage**: Notion and Google Calendar API calls remaining/used

#### 3. Logs Viewer
- Recent sync operations (last 100-500 events)
- Filterable by:
  - Operation type (create/update/delete)
  - Direction (Notion → GCal / GCal → Notion)
  - Status (success/failure)
  - Time range
- Display: timestamp, event title, operation, status, error details

#### 4. Debug Tools
- Manual trigger sync button
- Event mapping viewer (show linked Notion/GCal pairs)
- Webhook test endpoints
- Clear error counts

### UI/UX
- **Styling**: Tailwind CSS with shadcn/ui components
- **Responsive**: Mobile-friendly layout
- **Real-time updates**: Auto-refresh metrics every 30-60 seconds
- **Dark mode**: Optional support via shadcn/ui theming

---

## API Structure

### Webhook Endpoints

#### `POST /api/webhooks/notion`
Receives Notion database change notifications
- Validates webhook signature (if Notion supports it)
- Parses event data
- Determines operation type (create/update/delete)
- Syncs to Google Calendar
- Returns 200 on success, 5xx on failure (triggers retry)

#### `POST /api/webhooks/google-calendar`
Receives Google Calendar push notifications
- Validates notification authenticity
- Fetches changed event details
- Determines operation type
- Syncs to Notion
- Returns 200 on success, 5xx on failure (triggers retry)

#### `GET /api/webhooks/google-calendar`
Webhook verification endpoint for Google Calendar setup

### Utility Endpoints

#### `GET /api/status`
Returns current sync status and health metrics
- Used by dashboard
- Public or simple auth token

#### `POST /api/sync/manual`
Manually trigger a sync check
- Useful for debugging
- Protected endpoint

#### `GET /api/metrics`
Returns detailed metrics for dashboard
- Success/failure counts
- Operation breakdown
- API quota information

---

## Implementation Details

### Notion API Integration
- **SDK**: `@notionhq/client`
- **Database schema**: Requires properties:
  - Title (text)
  - Start time (date)
  - End time (date)
  - Description (text)
  - Location (text)
  - Status/Color (select or status)
  - GCal Event ID (text) - for mapping
  - Reminders (text or number) - encoded as needed

### Google Calendar API Integration
- **SDK**: `googleapis` (Google Calendar API v3)
- **Extended properties**: Use `extendedProperties.private.notion_page_id` for mapping
- **Push notifications**: Set up using Google Calendar API watch method
- **Token refresh**: Implement OAuth refresh token flow

### Loop Prevention
1. When Notion webhook fires:
   - Check if Notion page has `gcal_event_id`
   - If yes: UPDATE existing GCal event
   - If no: CREATE new GCal event, store returned event ID in Notion
2. When GCal webhook fires:
   - Check if GCal event has `extendedProperties.private.notion_page_id`
   - If yes: UPDATE existing Notion page
   - If no: CREATE new Notion page, store page ID in GCal event

### Webhook Setup
**Google Calendar**:
- Use Calendar API `events.watch()` to establish push notifications
- Requires public HTTPS endpoint (Vercel provides this)
- Webhooks expire, need periodic renewal (implement refresh job)

**Notion**:
- Notion doesn't support webhooks natively (as of 2025)
- Alternative approaches:
  - **Option A**: Poll Notion API every 1-5 minutes using Vercel Cron
  - **Option B**: Use third-party service like Zapier/Make/n8n to convert Notion changes to webhooks
  - **Option C**: Wait for Notion to release webhook support

**Recommendation**: Start with Notion polling via Vercel Cron, migrate to webhooks when available

---

## Testing Strategy

### Unit Tests
- Data transformation functions (Notion ↔ GCal format conversion)
- Loop prevention logic
- Retry mechanism
- Timezone conversion utilities

### Integration Tests
- Mock Notion API responses → verify GCal update calls
- Mock GCal API responses → verify Notion update calls
- Webhook signature validation
- Error handling flows

### Manual Testing Checklist
- Create event in Notion → appears in GCal
- Create event in GCal → appears in Notion
- Update event title in Notion → updates in GCal
- Update event time in GCal → updates in Notion
- Delete event in Notion → deletes in GCal
- Delete event in GCal → deletes in Notion
- Simultaneous edits → GCal wins
- Recurring event in GCal → individual instances in Notion
- API rate limit handling
- Network failure recovery

---

## Future Enhancements (Out of Scope for v1)

### Planned Extensions
- Multiple Google Calendar support with routing rules
- Bulk historical sync tool
- Advanced filtering (tag-based, calendar-based)
- Attendee synchronization
- Persistent error queue with manual resolution
- Email/Slack notifications for sync failures
- Sync analytics and insights
- Bi-directional recurrence pattern support

### Technical Debt to Monitor
- Lack of audit trail (consider lightweight logging database later)
- No transaction support (events could be orphaned on partial failures)
- Webhook renewal for GCal push notifications (needs periodic refresh)
- Notion polling frequency vs. real-time needs

---

## Deployment Checklist

### Prerequisites
- [ ] Notion integration created with appropriate permissions
- [ ] Notion database ID identified
- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth 2.0 credentials obtained
- [ ] Vercel account setup

### Environment Variables
```bash
# Notion
NOTION_API_TOKEN=secret_xxx
NOTION_DATABASE_ID=xxx

# Google Calendar
GOOGLE_CALENDAR_CLIENT_ID=xxx
GOOGLE_CALENDAR_CLIENT_SECRET=xxx
GOOGLE_CALENDAR_REFRESH_TOKEN=xxx
GOOGLE_CALENDAR_CALENDAR_ID=primary

# Optional
NODE_ENV=production
LOG_LEVEL=info
```

### Deployment Steps
1. Deploy Next.js app to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up Google Calendar webhook to `https://your-app.vercel.app/api/webhooks/google-calendar`
4. Set up Vercel Cron for Notion polling (if using polling approach)
5. Verify webhook endpoints are accessible
6. Test with a single event creation in both systems
7. Monitor dashboard for sync status

---

## Success Criteria

### Functional Requirements
- ✅ Events created in Notion appear in Google Calendar within 30 seconds
- ✅ Events created in Google Calendar appear in Notion within 30 seconds
- ✅ Updates propagate bidirectionally
- ✅ Deletions propagate bidirectionally
- ✅ No duplicate events created
- ✅ Dashboard displays accurate metrics and logs

### Non-Functional Requirements
- ✅ 99% sync success rate under normal conditions
- ✅ Graceful degradation during API outages
- ✅ Zero-cost hosting (within Vercel free tier)
- ✅ Response time <3 seconds for webhook processing
- ✅ Clear error messages in dashboard for debugging

---

## Known Limitations

1. **No Notion native webhooks**: Requires polling or third-party integration
2. **Recurring events complexity**: Each instance is separate, not a linked series
3. **No sync history**: Can't replay or audit past sync operations
4. **Single database**: Only one Notion database supported initially
5. **Manual token management**: OAuth tokens must be manually obtained and configured
6. **Attendee sync limitations**: Notion has limited multi-person event support
7. **No offline support**: Requires active internet connection for both APIs

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limiting | Medium | Medium | Implement retry with backoff, monitor quotas |
| Notion lack of webhooks | High | Low | Use polling as fallback, acceptable for personal use |
| Token expiration | Medium | High | Implement auto-refresh for GCal, alert on Notion token issues |
| Infinite loop bug | Low | Critical | Thorough testing of loop prevention logic |
| Data loss on deletion | Medium | Medium | Consider soft-delete in future version if needed |
| Timezone bugs | Medium | Medium | Comprehensive timezone testing, UTC storage |

---

## Appendix

### Notion Database Schema Example
```
Calendar Events (Database)
├── Title (title)
├── Start Time (date, with time)
├── End Time (date, with time)
├── Description (text)
├── Location (text)
├── Status (select: Confirmed/Tentative/Cancelled)
├── Reminders (number, minutes before event)
└── GCal Event ID (text, hidden in views)
```

### Google Calendar Extended Properties Example
```json
{
  "extendedProperties": {
    "private": {
      "notion_page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  }
}
```

### Tech Stack Summary
- **Frontend**: Next.js 14+, React, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Radix UI
- **APIs**: Notion SDK (`@notionhq/client`), Google APIs (`googleapis`)
- **Testing**: Jest/Vitest, React Testing Library
- **Deployment**: Vercel (serverless functions, edge network)
- **Monitoring**: Vercel Analytics (optional), custom dashboard

---

**Document Version**: 1.0
**Last Updated**: 2026-01-04
**Status**: Ready for Implementation
