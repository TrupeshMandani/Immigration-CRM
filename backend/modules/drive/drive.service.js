const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// ---- Auth (OAuth token flow) ----
function getDriveClient() {
  const creds = require('../../config/client_secret.json').installed;
  const token = require('../../config/oauth_token.json');

  const auth = new google.auth.OAuth2(
    creds.client_id,
    creds.client_secret,
    creds.redirect_uris[0]
  );
  auth.setCredentials(token);
  return google.drive({ version: 'v3', auth });
}

const PARENT_ID = process.env.DRIVE_PARENT_FOLDER_ID || null;

// ----- Folder helpers -----

/** Find existing student folder by name (under optional parent) */
async function findStudentFolder(aiKey) {
  const drive = getDriveClient();
  const name = `Student_${aiKey}`;

  // build Drive query
  const clauses = [
    `name = '${name.replace(/'/g, "\\'")}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`,
  ];
  if (PARENT_ID) clauses.push(`'${PARENT_ID}' in parents`);

  const q = clauses.join(' and ');

  const res = await drive.files.list({
    q,
    fields: 'files(id,name,webViewLink,parents)',
    pageSize: 1,
  });

  return res.data.files?.[0] || null;
}

/** Create a new student folder under the configured parent (if any) */
async function createStudentFolder(aiKey) {
  const drive = getDriveClient();
  const fileMetadata = {
    name: `Student_${aiKey}`,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (PARENT_ID) fileMetadata.parents = [PARENT_ID];

  const res = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name, webViewLink, parents',
  });
  console.log(`📂 Created folder for ${aiKey}: ${res.data.id}`);
  return res.data;
}

/** Ensure a folder exists: find first, otherwise create */
async function ensureStudentFolder(aiKey) {
  const existing = await findStudentFolder(aiKey);
  if (existing) {
    console.log(`📁 Reusing existing folder for ${aiKey}: ${existing.id}`);
    return existing;
  }
  return await createStudentFolder(aiKey);
}

// ----- File upload + cleanup -----

/** Upload a file into a specific Drive folder */
async function uploadFileToDrive(filePath, fileName, folderId) {
  const drive = getDriveClient();

  const metadata = {
    name: fileName,
    parents: [folderId],
  };
  const media = { body: fs.createReadStream(filePath) };

  const res = await drive.files.create({
    resource: metadata,
    media,
    fields: 'id, webViewLink, parents',
  });

  console.log(`☁️ Uploaded file: ${fileName} → ${folderId}`);
  return res.data;
}

/** Delete local file after successful upload */
function deleteLocalFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log('🗑️ Deleted local file', filePath);
  } catch (err) {
    console.warn('⚠️ Failed to delete local file:', err.message);
  }
}

module.exports = {
  ensureStudentFolder,
  findStudentFolder,
  createStudentFolder,
  uploadFileToDrive,
  deleteLocalFile,
};
