# Vercel Deployment

This guide walks through deploying Notion-Google Calendar Sync to Vercel.

## Option 1: One-Click Deploy

The easiest way to deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fnotion-gcal-sync&env=NEXTAUTH_SECRET,AUTH_GOOGLE_ID,AUTH_GOOGLE_SECRET,AUTHORIZED_EMAILS,UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN&project-name=notion-gcal-sync&repository-name=notion-gcal-sync)

1. Click the button above
2. Connect your GitHub account if prompted
3. Fill in the environment variables (see below)
4. Click **Deploy**
5. Wait for deployment to complete
6. Visit your app and complete the setup wizard at `/setup`

## Option 2: Manual Deployment

### Fork the Repository

1. Go to [github.com/mcsdevv/notion-gcal-sync](https://github.com/mcsdevv/notion-gcal-sync)
2. Click **Fork**
3. Create the fork in your account

### Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import** next to your forked repository
3. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `next build` (default)
4. Add environment variables (see below)
5. Click **Deploy**

## Environment Variables

### Required Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXTAUTH_SECRET` | NextAuth.js secret | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID | [Google Cloud Console](https://console.cloud.google.com) |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret | [Google Cloud Console](https://console.cloud.google.com) |
| `AUTHORIZED_EMAILS` | Comma-separated allowed emails | Your email address(es) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL | [Upstash Console](https://console.upstash.com) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | [Upstash Console](https://console.upstash.com) |

### Optional Variables (Can Use Setup Wizard Instead)

| Variable | Description |
|----------|-------------|
| `SETTINGS_ENCRYPTION_KEY` | 32-byte base64 key for encrypting stored credentials |
| `NOTION_API_TOKEN` | Notion integration secret |
| `NOTION_DATABASE_ID` | Notion database ID |
| `GOOGLE_CALENDAR_CLIENT_ID` | Google OAuth client ID for calendar sync |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Google OAuth client secret for calendar sync |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | Google OAuth refresh token |
| `GOOGLE_CALENDAR_CALENDAR_ID` | Calendar ID (default: `primary`) |

If you skip the optional variables, you'll configure them in the setup wizard.

**Note:** The Google OAuth credentials for the dashboard (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`) are the same ones used for calendar sync. You only need to create one OAuth client.

## Post-Deployment Setup

### 1. Update OAuth Redirect URIs

After deployment, update your Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Credentials**
3. Edit your OAuth client
4. Add to **Authorized redirect URIs**:
   ```
   https://YOUR-APP.vercel.app/api/auth/callback/google
   https://YOUR-APP.vercel.app/api/setup/google-oauth/callback
   ```
5. Save changes

### 2. Complete Setup Wizard

1. Visit `https://YOUR-APP.vercel.app/setup`
2. Follow the wizard to:
   - Connect Google Calendar (OAuth flow)
   - Connect Notion (paste API token)
   - Select and configure your database
   - Map fields
   - Test connections

### 3. Verify Sync

1. Create a test event in Notion
2. Check that it appears in Google Calendar within 30 seconds
3. Create a test event in Google Calendar
4. Check that it appears in Notion within 30 seconds

## Custom Domain (Optional)

1. Go to your Vercel project
2. Navigate to **Settings** > **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update OAuth redirect URIs with new domain

## Troubleshooting

### Build Failures

**Error: Missing environment variables**
- Ensure all required variables are set
- Check for typos in variable names

**Error: Type errors**
- This shouldn't happen with the released version
- Try redeploying or check for upstream issues

### Runtime Errors

**"Failed to connect to Redis"**
- Verify Upstash URL and token are correct
- Check Upstash dashboard for connection issues

**"Invalid encryption key"**
- Key must be exactly 32 bytes base64-encoded
- Generate a new key: `openssl rand -base64 32`

**"OAuth error"**
- Check redirect URIs match exactly
- Verify client ID and secret
- Ensure Calendar API is enabled

### Sync Issues

**Events not syncing**
- Check dashboard at `/` for error logs
- Verify webhook is registered (Settings page)
- Test connections in Settings

**Duplicate events**
- This indicates a loop prevention issue
- Check that `GCal Event ID` property exists in Notion
- Contact support if persists

### Webhook Expiration

Google Calendar webhooks expire after 7 days. The app automatically renews them, but if sync stops:

1. Go to Settings page
2. Check webhook status
3. Click "Refresh Webhook" if expired

## Updating

To update to a new version:

1. Pull latest changes to your fork
2. Vercel automatically redeploys on push
3. Or trigger manual redeploy in Vercel dashboard

## Monitoring

### Vercel Dashboard
- View deployment logs
- Monitor function invocations
- Check for errors

### App Dashboard
- Real-time sync status
- Event logs
- Error tracking

## Next Steps

- [Architecture Overview](../architecture/overview.md) - Understand how the sync works
- [Development Guide](../contributing/development.md) - Set up local development
- [Troubleshooting](#troubleshooting) - Common issues and solutions
