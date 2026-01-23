# Google OAuth Setup

This guide walks through creating a Google Cloud project and configuring OAuth for Google Calendar access.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click the project dropdown at the top
3. Click **New Project**
4. Enter project name: `Notion Calendar Sync` (or your preference)
5. Click **Create**
6. Wait for the project to be created, then select it

## Step 2: Enable Google Calendar API

1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on **Google Calendar API**
4. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** user type (unless you have Google Workspace)
3. Click **Create**

### App Information
- **App name**: `Notion Calendar Sync`
- **User support email**: Your email
- **App logo**: Optional

### App Domain
Leave blank for now (or add your Vercel domain after deployment)

### Developer Contact
- **Developer contact email**: Your email

4. Click **Save and Continue**

### Scopes
1. Click **Add or Remove Scopes**
2. Find and select:
   - `https://www.googleapis.com/auth/calendar` (full calendar access)
   - `https://www.googleapis.com/auth/calendar.events` (event management)
3. Click **Update**
4. Click **Save and Continue**

### Test Users
1. Click **Add Users**
2. Enter your Google email address
3. Click **Add**
4. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Enter name: `Notion Calendar Sync Web`

### Authorized JavaScript Origins
Add your Vercel domain (after deployment):
```
https://your-app.vercel.app
```

For local development:
```
http://localhost:3000
```

### Authorized Redirect URIs
Add these URIs:
```
https://your-app.vercel.app/api/auth/callback/google
https://your-app.vercel.app/api/setup/google-oauth/callback
```

For local development:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/setup/google-oauth/callback
```

5. Click **Create**
6. Copy the **Client ID** and **Client Secret** - you'll need these for deployment

## Step 5: Publish App (Optional)

While in "Testing" mode, tokens expire after 7 days. To avoid this:

1. Go to **OAuth consent screen**
2. Click **Publish App**
3. Confirm the warning
4. Google may require verification for sensitive scopes

For personal use, keeping the app in "Testing" mode is fine - just re-authenticate when tokens expire.

## Environment Variables

After completing this setup, you'll have:

| Variable | Value |
|----------|-------|
| `GOOGLE_CALENDAR_CLIENT_ID` | Your OAuth client ID |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | Your OAuth client secret |

The refresh token will be obtained during the setup wizard.

## Troubleshooting

### "Access Blocked" Error
- Ensure your email is added as a test user
- Check that Calendar API is enabled
- Verify redirect URIs match exactly (including trailing slashes)

### "Invalid Client" Error
- Double-check Client ID and Secret
- Ensure credentials are for a Web application, not Desktop

### Token Expiration
- Test users get 7-day tokens
- Publish app for longer-lived tokens
- The app handles automatic refresh

## Next Steps

[Create Notion Integration](03-notion-integration.md)
