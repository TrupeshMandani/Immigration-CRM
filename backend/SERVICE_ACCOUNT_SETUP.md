# Service Account Setup - Step by Step

## 🎯 **What You Need to Do**

### Step 1: Create Service Account in Google Cloud Console

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/)
2. **Select your project**: `immigration-crm-474607`
3. **Go to**: "APIs & Services" → "Credentials"
4. **Click**: "Create Credentials" → "Service Account"
5. **Fill Details**:
   - Service account name: `immigration-crm-drive`
   - Service account ID: `immigration-crm-drive`
   - Description: `Service account for Immigration CRM Google Drive access`
6. **Click**: "Create and Continue"
7. **Skip Role Assignment** (click "Continue")
8. **Click**: "Done"

### Step 2: Create Service Account Key

1. **Click on**: The service account you just created
2. **Go to**: "Keys" tab
3. **Click**: "Add Key" → "Create New Key"
4. **Select**: "JSON"
5. **Click**: "Create"
6. **Download**: The JSON file (keep it secure!)

### Step 3: Extract Credentials from JSON

Open the downloaded JSON file and copy these values:

```json
{
  "type": "service_account",
  "project_id": "immigration-crm-474607",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "immigration-crm-drive@immigration-crm-474607.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 4: Update Your .env File

Replace your current values with:

```bash
# Google Drive Service Account
GOOGLE_CLIENT_EMAIL=immigration-crm-drive@immigration-crm-474607.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_FROM_JSON\n-----END PRIVATE KEY-----\n"
DRIVE_PARENT_FOLDER_ID=1hkSUQrwMLbtPTzZSQKEXVI4VpAXbfHFC
```

**Important**:

- Copy the `client_email` from the JSON
- Copy the `private_key` from the JSON (it should start with `-----BEGIN PRIVATE KEY-----`)
- Keep the quotes around the private key
- The private key should have actual newlines, not `\n` characters

### Step 5: Test the Configuration

```bash
cd backend
node test-google-drive-config.js
```

## 🔍 **What You Currently Have**

- ✅ **GOOGLE_CLIENT_EMAIL**: `immigration-crm-sa@immigration-crm-474607.iam.gserviceaccount.com` (looks like service account email)
- ❌ **GOOGLE_PRIVATE_KEY**: `GOCSPX-3FhnAyB0zdGxtxrqU7IhI8D...` (this is OAuth client secret, not private key)
- ✅ **DRIVE_PARENT_FOLDER_ID**: `1hkSUQrwMLbtPTzZSQKEXVI4VpAXbfHFC` (looks correct)

## 🎯 **The Fix**

You need to replace your `GOOGLE_PRIVATE_KEY` with the actual private key from the service account JSON file.

The private key should look like:

```
-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[long base64 encoded string]
...
-----END PRIVATE KEY-----
```

**Not like:**

```
GOCSPX-3FhnAyB0zdGxtxrqU7IhI8D...
```

## 🚀 **After You Fix It**

Once you update the private key, your Immigration CRM will be able to:

- ✅ Upload files to Google Drive
- ✅ Create student-specific folders
- ✅ Generate shareable links
- ✅ Store files permanently in the cloud
- ✅ Provide document previews and downloads
