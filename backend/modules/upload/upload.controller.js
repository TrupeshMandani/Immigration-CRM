const fs = require('fs');
const path = require('path');
const { extractProfileWithAI } = require('../extract/extract.service');
const { ensureStudentFolder, uploadFileToDrive, deleteLocalFile } = require('../drive/drive.service');
const { upsertStudent } = require('../students/student.service');
const Student = require('../../models/Student');

exports.handleUpload = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // pick aiKey: prefer incoming body, else keep previous, else fallback
    const bodyKey = req.body.aiKey && String(req.body.aiKey).trim();
    let aiKey = bodyKey || `student-${Date.now()}`;

    // (optional) if you already extracted profile earlier, you can call AI here:
    // const profile = await extractProfileWithAI(files);

    // 1) ensure/reuse Drive folder for this aiKey
    const folder = await ensureStudentFolder(aiKey);

    // 2) upload each file into that folder
    const uploaded = [];
    for (const f of files) {
      // f.path is already a full path from Multer; if you use filename, adjust accordingly
      const uploadedFile = await uploadFileToDrive(f.path, f.originalname, folder.id);
      uploaded.push(uploadedFile);
      deleteLocalFile(f.path);
    }

    // 3) upsert student (merge drive info; profile optional)
    const student = await upsertStudent({
      aiKey,
      // profile, // uncomment if you extracted one above
      drive: { folderId: folder.id, webViewLink: folder.webViewLink },
    });

    res.json({
      message: `Uploaded ${uploaded.length} files to Google Drive`,
      aiKey,
      driveFolder: folder.webViewLink,
      uploaded,
      student,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};
