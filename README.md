# Notion-Google Calendar Sync

[![CI](https://github.com/mcsdevv/notion-gcal-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/mcsdevv/notion-gcal-sync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bidirectional, real-time sync between Notion calendar databases and Google Calendar. Built with Next.js and deployable to Vercel with one click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fnotion-gcal-sync&env=NEXTAUTH_SECRET,AUTH_GOOGLE_ID,AUTH_GOOGLE_SECRET,AUTHORIZED_EMAILS,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&project-name=notion-gcal-sync&repository-name=notion-gcal-sync)

## Features

- **Bidirectional Sync**: Changes in Notion appear in Google Calendar and vice versa
- **Real-time Updates**: Webhook-driven sync with near-instant propagation
- **Web-based Setup**: Interactive wizard for OAuth and configuration (no manual token management)
- **Dashboard**: Monitor sync status, view logs, and debug issues
- **Field Mapping**: Customize how Notion properties map to Google Calendar fields
- **Encrypted Storage**: Credentials stored securely with AES-256-GCM encryption

## Prerequisites

Before deploying, you'll need:

1. **Google Cloud Project** with Calendar API enabled ([Guide](docs/setup/02-google-oauth.md))
2. **Notion Integration** with access to your calendar database ([Guide](docs/setup/03-notion-integration.md))
3. **Upstash Redis** database for settings storage (free tier works)
4. **Vercel Account** for hosting

## Quick Start

1. Click the **Deploy with Vercel** button above
2. Complete the setup wizard at `/setup` after deployment
3. Start creating events!

For detailed setup instructions, see the [Setup Guides](docs/setup/).

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | NextAuth.js secret (`openssl rand -base64 32`) |
| `AUTH_GOOGLE_ID` | Yes | Google OAuth client ID for dashboard auth |
| `AUTH_GOOGLE_SECRET` | Yes | Google OAuth client secret for dashboard auth |
| `AUTHORIZED_EMAILS` | Yes | Comma-separated list of emails allowed to access dashboard |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis URL |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis token |
| `SETTINGS_ENCRYPTION_KEY` | No | 32-byte base64 key for encryption |
| `NOTION_API_TOKEN` | Optional* | Notion integration token |
| `NOTION_DATABASE_ID` | Optional* | Notion calendar database ID |
| `GOOGLE_CALENDAR_CLIENT_ID` | Optional* | Google OAuth client ID for calendar sync |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Optional* | Google OAuth client secret for calendar sync |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Optional* | Google OAuth refresh token |
| `GOOGLE_CALENDAR_CALENDAR_ID` | No | Calendar ID (defaults to `primary`) |

*These can be configured via the web UI instead of environment variables.

### Field Mapping

Default mapping (customizable in Settings):

| Notion Property | Google Calendar Field |
|-----------------|----------------------|
| Title | Event title |
| Date | Start/end time |
| Description | Description |
| Location | Location |
| Reminders | Default reminders |

## Documentation

- **Setup Guides**
  - [Prerequisites](docs/setup/01-prerequisites.md)
  - [Google OAuth Setup](docs/setup/02-google-oauth.md)
  - [Notion Integration](docs/setup/03-notion-integration.md)
  - [Vercel Deployment](docs/setup/04-vercel-deployment.md)

- **Developer Docs**
  - [Architecture Overview](docs/architecture/overview.md)
  - [Development Guide](docs/contributing/development.md)
  - [Testing Guide](docs/contributing/testing.md)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **APIs**: Notion SDK, Google Calendar API
- **Storage**: Upstash Redis
- **Hosting**: Vercel

## Development

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Run tests
bun run test

# Type check
bun run typecheck

# Lint
bun run lint
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Open an issue](https://github.com/mcsdevv/notion-gcal-sync/issues) for bugs or feature requests
- See [Troubleshooting](docs/setup/04-vercel-deployment.md#troubleshooting) for common issues
