# Notion-Google Calendar Sync

[![CI](https://github.com/mcsdevv/notion-gcal-sync/actions/workflows/ci.yml/badge.svg)](https://github.com/mcsdevv/notion-gcal-sync/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bidirectional, real-time sync between Notion calendar databases and Google Calendar. Built with Next.js and deployable to Vercel with one click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fnotion-gcal-sync%2Ftree%2Fmain%2Fapps%2Fdashboard&env=NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,NOTION_CLIENT_ID,NOTION_CLIENT_SECRET,ENCRYPTION_KEY,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&envDescription=Required%20environment%20variables%20for%20the%20sync%20app&envLink=https%3A%2F%2Fdocs.notion-gcal-sync.com%2Fsetup%2Fvercel&project-name=notion-gcal-sync&repository-name=notion-gcal-sync)

## Features

- **Bidirectional Sync**: Changes in Notion appear in Google Calendar and vice versa
- **Real-time Updates**: Webhook-driven sync with near-instant propagation
- **Web-based Setup**: Interactive wizard for OAuth and configuration (no manual token management)
- **Dashboard**: Monitor sync status, view logs, and debug issues
- **Field Mapping**: Customize how Notion properties map to Google Calendar fields
- **Encrypted Storage**: Credentials stored securely with AES-256-GCM encryption

## Project Structure

This is a Turborepo monorepo with the following structure:

```
├── apps/
│   ├── dashboard/     # Sync app (what you deploy)
│   └── web/           # Marketing site
├── packages/
│   └── ui/            # Shared UI components
└── docs/              # Mintlify documentation
```

## Quick Start

1. Click the **Deploy with Vercel** button above
2. Configure your environment variables
3. Complete the setup wizard at `/setup` after deployment
4. Start creating events!

For detailed setup instructions, see the [Documentation](https://docs.notion-gcal-sync.com).

## Prerequisites

Before deploying, you'll need:

1. **Google Cloud Project** with Calendar API enabled ([Guide](https://docs.notion-gcal-sync.com/setup/google))
2. **Notion Integration** with access to your calendar database ([Guide](https://docs.notion-gcal-sync.com/setup/notion))
3. **Vercel Account** for hosting (Redis storage is included via Vercel Marketplace)

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXTAUTH_SECRET` | Yes | Session encryption key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NOTION_CLIENT_ID` | Yes | Notion OAuth client ID |
| `NOTION_CLIENT_SECRET` | Yes | Notion OAuth client secret |
| `ENCRYPTION_KEY` | Yes | 32-byte base64 key for credential encryption |
| `UPSTASH_REDIS_REST_URL` | Auto | Auto-configured via Vercel Marketplace |
| `UPSTASH_REDIS_REST_TOKEN` | Auto | Auto-configured via Vercel Marketplace |

Generate encryption keys with:
```bash
openssl rand -base64 32
```

## Documentation

Full documentation is available at [docs.notion-gcal-sync.com](https://docs.notion-gcal-sync.com):

- [Quickstart Guide](https://docs.notion-gcal-sync.com/quickstart)
- [Google OAuth Setup](https://docs.notion-gcal-sync.com/setup/google)
- [Notion Integration Setup](https://docs.notion-gcal-sync.com/setup/notion)
- [Vercel Deployment](https://docs.notion-gcal-sync.com/setup/vercel)
- [Field Mapping Guide](https://docs.notion-gcal-sync.com/guides/field-mapping)
- [Troubleshooting](https://docs.notion-gcal-sync.com/guides/troubleshooting)
- [Architecture](https://docs.notion-gcal-sync.com/architecture)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Build**: Turborepo
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **APIs**: Notion SDK, Google Calendar API
- **Storage**: Redis (via Vercel Marketplace)
- **Hosting**: Vercel
- **Docs**: Mintlify

## Development

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint
```

### Working with specific apps

```bash
# Run only the dashboard
pnpm --filter @notion-gcal-sync/dashboard dev

# Run only the marketing site
pnpm --filter @notion-gcal-sync/web dev

# Build only the UI package
pnpm --filter @notion-gcal-sync/ui build
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Open an issue](https://github.com/mcsdevv/notion-gcal-sync/issues) for bugs or feature requests
- See [Troubleshooting](https://docs.notion-gcal-sync.com/guides/troubleshooting) for common issues
