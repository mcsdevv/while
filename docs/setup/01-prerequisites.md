# Prerequisites

Before setting up Notion-Google Calendar Sync, you'll need to create accounts and configure services.

## Required Accounts

### 1. Vercel Account

Vercel hosts the application and provides serverless functions.

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or email
3. Free tier is sufficient for personal use

### 2. Upstash Account

Upstash provides serverless Redis for storing encrypted settings.

1. Go to [upstash.com](https://upstash.com)
2. Create a free account
3. Create a new Redis database:
   - Name: `notion-gcal-sync` (or any name)
   - Region: Choose closest to your Vercel deployment
   - Type: Regional (free tier)
4. Copy the **REST URL** and **REST Token** from the database details

### 3. Google Cloud Account

Required for Google Calendar API access.

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select an existing one

See [Google OAuth Setup](02-google-oauth.md) for detailed configuration.

### 4. Notion Account

Required for accessing your Notion calendar database.

1. Go to [notion.so](https://notion.so)
2. Sign in or create an account
3. Create or identify your calendar database

See [Notion Integration Setup](03-notion-integration.md) for detailed configuration.

## Generate Encryption Key

The application requires a 32-byte encryption key for storing credentials securely.

### Using OpenSSL (macOS/Linux)

```bash
openssl rand -base64 32
```

### Using Node.js

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save this key securely - you'll need it for the `SETTINGS_ENCRYPTION_KEY` environment variable.

## Notion Database Requirements

Your Notion calendar database should have these properties:

| Property | Type | Required | Notes |
|----------|------|----------|-------|
| Title | Title | Yes | Event name |
| Date | Date | Yes | Must include time, can have end date |
| Description | Text | No | Event details |
| Location | Text | No | Physical or virtual location |
| Reminders | Number | No | Minutes before event |
| GCal Event ID | Text | Auto | Created by sync (hidden recommended) |

The setup wizard will help you map your existing properties to these fields.

## Next Steps

1. [Set up Google OAuth](02-google-oauth.md)
2. [Create Notion Integration](03-notion-integration.md)
3. [Deploy to Vercel](04-vercel-deployment.md)
