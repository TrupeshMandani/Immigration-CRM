# Google Drive Setup Guide

## Why This is Needed

Currently, documents are being processed by AI and stored in the database, but the preview functionality requires Google Drive integration. Without it, users see "Preview not available" when clicking on documents.

## Quick Setup (5 minutes)

### Step 1: Get Google Drive Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Desktop application"
6. Download the JSON file as `client_secret.json`
7. Place it in `backend/config/client_secret.json`

### Step 2: Run the Setup Script

```bash
cd backend
node scripts/setup-google-drive-oauth.js
```

Follow the prompts:

1. Visit the authorization URL
2. Sign in with your Google account
3. Grant permissions to the application
4. Copy the authorization code
5. Paste it in the terminal

### Step 3: Restart Backend

```bash
# Stop current backend (Ctrl+C)
# Then restart:
npm run dev
```

## What This Enables

✅ **Document Previews**: PDFs and images can be viewed directly in the browser  
✅ **Download Links**: Users can download documents from Google Drive  
✅ **Cloud Storage**: Documents are stored securely in Google Drive  
✅ **Better UX**: No more "Preview not available" messages

## Current Status

- ✅ **AI Processing**: Working (extracts data from documents)
- ✅ **Database Storage**: Working (stores document metadata)
- ✅ **Profile Updates**: Working (cumulative data)
- ⏳ **Document Preview**: Pending Google Drive setup

## Alternative: Local File Storage

If you prefer not to use Google Drive, we can modify the system to:

- Store files locally on the server
- Provide direct download links
- Show file information without preview

Let me know if you'd like this alternative approach instead.

## Troubleshooting

**"client_secret.json not found"**

- Make sure the file is in `backend/config/`
- Check the filename is exactly `client_secret.json`

**"Invalid credentials"**

- Regenerate credentials in Google Cloud Console
- Make sure Google Drive API is enabled

**"Authorization failed"**

- Try the setup script again
- Make sure you're using the correct Google account

## Security Note

- Keep `oauth_token.json` secure
- Don't commit it to git
- It's already in `.gitignore`

---

**Need help?** The setup script provides detailed instructions and error messages to guide you through the process.
