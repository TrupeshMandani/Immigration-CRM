# Frontend Debug Guide

## Issue: "Something went wrong - Failed to load documents"

This error is coming from the ErrorBoundary component wrapping the DocumentManager.

## Debugging Steps

### 1. Check Browser Console

Open the browser developer tools (F12) and check the Console tab for any JavaScript errors.

### 2. Check Network Tab

Check the Network tab to see if the API call to `/api/students/{aiKey}/files` is being made and what the response is.

### 3. Check User Authentication

The Documents page should show debug logs in the console:

- `📄 Documents page - User:` (should show user object)
- `📄 Documents page - User aiKey:` (should show the aiKey)

### 4. Check DocumentManager Logs

The DocumentManager should show logs:

- `📁 DocumentManager: Fetching documents for aiKey:` (should show the aiKey)
- `📁 DocumentManager: Received response:` (should show API response)
- `📁 DocumentManager: Files array:` (should show files array)

## Expected Behavior

1. **User Login**: User should be logged in with aiKey
2. **API Call**: DocumentManager should call `/api/students/{aiKey}/files`
3. **Response**: Should receive files array with document data
4. **Display**: Should show documents in the UI

## Common Issues

1. **No aiKey**: User object doesn't have aiKey property
2. **API Error**: Backend API call fails
3. **JavaScript Error**: Component crashes due to data formatting
4. **Authentication**: User not properly authenticated

## Test Credentials

Use this test student to debug:

- Username: `viewer1761000776467`
- Password: `testpass123`
- Expected aiKey: `contact-1761000776471-zpk6h0nbk`

## Quick Fix

If the issue persists, try:

1. Refresh the page (Ctrl+F5 for hard refresh)
2. Clear browser cache
3. Check browser console for errors
4. Verify user is logged in properly

## Backend API Test

The backend API is working correctly:

```bash
curl "http://localhost:4000/api/students/contact-1761000776471-zpk6h0nbk/files"
```

Returns:

```json
{
  "folder": "#",
  "files": [
    {
      "fileId": "mock-file-1761000778705",
      "name": "test-document.txt",
      "mimeType": "application/octet-stream",
      "webViewLink": "#",
      "uploadedAt": "2025-10-20T22:52:58.706Z"
    }
  ],
  "totalFiles": 1
}
```
