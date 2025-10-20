# Google Drive Setup - Complete Guide

## 🎯 **Recommended: Service Account Method (Easiest)**

### Step 1: Create Google Cloud Project

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Create Project**:
   - Click "Select a project" → "New Project"
   - Name: `Immigration CRM`
   - Click "Create"

### Step 2: Enable Google Drive API

1. **Go to**: "APIs & Services" → "Library"
2. **Search**: "Google Drive API"
3. **Click**: "Enable"

### Step 3: Create Service Account

1. **Go to**: "APIs & Services" → "Credentials"
2. **Click**: "Create Credentials" → "Service Account"
3. **Fill Details**:
   - Service account name: `immigration-crm-drive`
   - Service account ID: `immigration-crm-drive`
   - Description: `Service account for Immigration CRM Google Drive access`
4. **Click**: "Create and Continue"
5. **Skip Role Assignment** (click "Continue")
6. **Click**: "Done"

### Step 4: Create Service Account Key

1. **Click on**: The created service account
2. **Go to**: "Keys" tab
3. **Click**: "Add Key" → "Create New Key"
4. **Select**: "JSON"
5. **Click**: "Create"
6. **Download**: The JSON file (keep it secure!)

### Step 5: Configure Environment Variables

Add these to your `backend/.env` file:

```bash
# Google Drive Service Account
GOOGLE_CLIENT_EMAIL=immigration-crm-drive@your-project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_FROM_JSON_FILE\n-----END PRIVATE KEY-----\n"
DRIVE_PARENT_FOLDER_ID=0Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**To get the values from your JSON file:**

- `GOOGLE_CLIENT_EMAIL`: Copy the `client_email` field
- `GOOGLE_PRIVATE_KEY`: Copy the `private_key` field (keep the quotes and \n)
- `DRIVE_PARENT_FOLDER_ID`: Create a folder in Google Drive and copy its ID from the URL

### Step 6: Create Parent Folder (Optional)

1. **Go to**: [Google Drive](https://drive.google.com/)
2. **Create Folder**: "Immigration CRM Files"
3. **Get Folder ID**:
   - Right-click folder → "Get link"
   - Copy the ID from URL: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Use this as `DRIVE_PARENT_FOLDER_ID`

## 🔄 **Alternative: OAuth 2.0 Method**

### Step 1: Create OAuth 2.0 Credentials

1. **Go to**: "APIs & Services" → "Credentials"
2. **Click**: "Create Credentials" → "OAuth 2.0 Client ID"
3. **Application Type**: "Desktop application"
4. **Name**: "Immigration CRM"
5. **Click**: "Create"
6. **Download**: JSON file as `client_secret.json`

### Step 2: Place Credentials File

```bash
# Place the downloaded JSON file in:
backend/config/client_secret.json
```

### Step 3: Run OAuth Setup

```bash
cd backend
node scripts/setup-google-drive-oauth.js
```

Follow the prompts to authorize the application.

## 🧪 **Test the Setup**

### Test Service Account Method

```bash
cd backend
node -e "
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/drive.file']
});
const drive = google.drive({ version: 'v3', auth });
drive.files.list({ pageSize: 1 }).then(res => {
  console.log('✅ Google Drive connected successfully!');
  console.log('Files found:', res.data.files.length);
}).catch(err => {
  console.error('❌ Google Drive connection failed:', err.message);
});
"
```

### Test OAuth Method

```bash
cd backend
node -e "
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, 'config/oauth_token.json');
if (fs.existsSync(tokenPath)) {
  console.log('✅ OAuth token found');
} else {
  console.log('❌ OAuth token not found - run setup script');
}
"
```

## 🚨 **Troubleshooting**

### Common Issues

1. **"Invalid credentials"**:

   - Check `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY` in `.env`
   - Ensure private key has proper `\n` characters

2. **"Access denied"**:

   - Service account needs Drive API access
   - Check if Drive API is enabled

3. **"Folder not found"**:
   - Verify `DRIVE_PARENT_FOLDER_ID` is correct
   - Ensure the folder exists and is accessible

### Debug Commands

```bash
# Check if environment variables are loaded
cd backend
node -e "console.log('Client Email:', process.env.GOOGLE_CLIENT_EMAIL); console.log('Private Key:', process.env.GOOGLE_PRIVATE_KEY ? 'Set' : 'Not set');"
```

## 📋 **Current Status**

Based on your terminal logs, you're getting:

```
❌ Error: Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential.
```

This means:

- ✅ Google Drive API is enabled
- ❌ Authentication credentials are missing or invalid
- ❌ Need to configure either Service Account or OAuth

## 🎯 **Recommended Next Steps**

1. **Choose Service Account method** (easier)
2. **Create service account** in Google Cloud Console
3. **Download JSON file** and extract credentials
4. **Add to `.env` file** with proper formatting
5. **Test connection** with the test script above
6. **Restart backend** to load new environment variables

## 🔐 **Security Notes**

- **Never commit** service account JSON files to git
- **Keep private keys secure**
- **Use environment variables** for production
- **Rotate keys regularly**

---

**Once configured, your Immigration CRM will be able to:**

- ✅ Upload files to Google Drive
- ✅ Create student-specific folders
- ✅ Generate shareable links
- ✅ Store files permanently in the cloud
- ✅ Provide document previews and downloads
