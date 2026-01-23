# Notion Integration Setup

This guide walks through creating a Notion integration and configuring database access.

## Step 1: Create Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **New integration**
3. Fill in the details:
   - **Name**: `Calendar Sync`
   - **Associated workspace**: Select your workspace
   - **Logo**: Optional
4. Click **Submit**

## Step 2: Configure Capabilities

After creating the integration, configure its capabilities:

### Content Capabilities
- **Read content**: Enabled (required)
- **Update content**: Enabled (required)
- **Insert content**: Enabled (required)

### Comment Capabilities
- **Read comments**: Disabled (not needed)
- **Insert comments**: Disabled (not needed)

### User Capabilities
- **Read user information**: Disabled (not needed)

Click **Save changes**.

## Step 3: Copy Integration Token

1. On the integration page, find **Internal Integration Secret**
2. Click **Show** then **Copy**
3. Save this token securely - it's your `NOTION_API_TOKEN`

This token starts with `secret_` and is shown only once. If lost, you'll need to regenerate it.

## Step 4: Connect to Database

The integration needs explicit access to your calendar database.

1. Open your Notion calendar database
2. Click the **...** menu in the top right
3. Go to **Connections** (or **Add connections**)
4. Find and select your **Calendar Sync** integration
5. Click **Confirm**

## Step 5: Get Database ID

You'll need your database ID for configuration.

### From the URL
1. Open your database in Notion (as a full page, not inline)
2. Look at the URL:
   ```
   https://notion.so/workspace/DATABASE_ID?v=VIEW_ID
   ```
3. The DATABASE_ID is the 32-character string before the `?`

### Example
URL: `https://notion.so/myworkspace/a1b2c3d4e5f6789012345678901234ab?v=...`
Database ID: `a1b2c3d4e5f6789012345678901234ab`

### Format
The setup wizard accepts either format:
- With dashes: `a1b2c3d4-e5f6-7890-1234-567890123456`
- Without dashes: `a1b2c3d4e5f6789012345678901234ab`

## Database Schema

Your database should have properties for calendar events. The setup wizard will help map your existing properties.

### Recommended Properties

| Property | Type | Purpose |
|----------|------|---------|
| Name/Title | Title | Event title (required) |
| Date | Date | Event date/time with end date (required) |
| Description | Text | Event details |
| Location | Text | Event location |
| Reminders | Number | Minutes before event for reminder |

### Required Property for Sync

The sync creates one additional property automatically:

| Property | Type | Purpose |
|----------|------|---------|
| GCal Event ID | Text | Links events between systems |

You can create this manually or let the setup wizard create it. It should be:
- Type: Text
- Visibility: Hidden in views (recommended)

## Environment Variables

After completing this setup, you'll have:

| Variable | Value |
|----------|-------|
| `NOTION_API_TOKEN` | Your integration secret (`secret_...`) |
| `NOTION_DATABASE_ID` | Your database ID |

## Troubleshooting

### "Could not find database" Error
- Ensure the integration is connected to the database
- Check the database ID is correct
- Verify the integration has read/write permissions

### "Unauthorized" Error
- Token may have been regenerated
- Check the token starts with `secret_`
- Ensure you're using the correct workspace

### Missing Properties
- The setup wizard shows available properties
- Create missing properties in Notion if needed
- Date property must support time (not just date)

### Integration Not Appearing
- Go to **Settings & Members** > **Connections**
- Check if the integration exists
- Try creating a new integration if issues persist

## Security Notes

- Integration tokens have full access to connected pages
- Only connect the integration to databases it needs
- Don't share your integration token publicly
- Regenerate the token if compromised

## Next Steps

[Deploy to Vercel](04-vercel-deployment.md)
