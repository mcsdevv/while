# While

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Bidirectional, real-time sync between Notion calendar databases and Google Calendar. Built with Next.js and deployable to Vercel with one click.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fwhile-dashboard-template&env=NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,AUTHORIZED_EMAILS,NOTION_API_TOKEN&envDescription=Required%20environment%20variables%20for%20While&envLink=https%3A%2F%2Fwhile.so%2Fdocs%2Fsetup%2Fvercel&project-name=while&repository-name=while)

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
└── docs/              # Fumadocs documentation
```

## Quick Start

1. Click the **Deploy with Vercel** button above
2. Configure your environment variables
3. Complete the setup wizard at `/setup` after deployment
4. Start creating events!

For detailed setup instructions, see the [Documentation](https://while.so/docs).

## Prerequisites

Before deploying, you'll need:

1. **Google Cloud Project** with Calendar API enabled ([Guide](https://while.so/docs/setup/google))
2. **Notion Integration** with access to your calendar database ([Guide](https://while.so/docs/setup/notion))
3. **Vercel Account** for deployment (Redis storage is included via Vercel Marketplace)

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (for auth + calendar) |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `NEXTAUTH_SECRET` | Yes | Session encryption key |
| `AUTHORIZED_EMAILS` | Yes | Comma-separated emails or patterns, spaces trimmed (`user@example.com, *@company.com`) |
| `NOTION_API_TOKEN` | Yes | Notion integration token ([setup guide](https://while.so/docs/setup/notion)) |
| `SETTINGS_ENCRYPTION_KEY` | Recommended | 32-byte base64 key for credential encryption |
| `UPSTASH_REDIS_REST_URL` | Auto | Auto-configured via Vercel Marketplace |
| `UPSTASH_REDIS_REST_TOKEN` | Auto | Auto-configured via Vercel Marketplace |

**Authorization**: Use wildcard patterns like `*@company.com` to allow all emails from a domain.

Generate secrets with:
```bash
openssl rand -base64 32
```

## Documentation

Full documentation is available at [while.so/docs](https://while.so/docs):

- [Quickstart Guide](https://while.so/docs/quickstart)
- [Google OAuth Setup](https://while.so/docs/setup/google)
- [Notion Integration Setup](https://while.so/docs/setup/notion)
- [Vercel Deployment](https://while.so/docs/setup/vercel)
- [Field Mapping Guide](https://while.so/docs/guides/field-mapping)
- [Troubleshooting](https://while.so/docs/guides/troubleshooting)
- [Architecture](https://while.so/docs/architecture)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Build**: Turborepo
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **APIs**: Notion SDK, Google Calendar API
- **Storage**: Redis (via Vercel Marketplace)
- **Deployment**: Vercel

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
pnpm --filter @while/dashboard dev

# Run only the marketing site
pnpm --filter @while/web dev

# Build only the UI package
pnpm --filter @while/ui build
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Open an issue](https://github.com/mcsdevv/while/issues) for bugs or feature requests
- See [Troubleshooting](https://while.so/docs/guides/troubleshooting) for common issues
