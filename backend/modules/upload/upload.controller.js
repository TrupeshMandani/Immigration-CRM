const fs = require("fs");
const path = require("path");
const { extractProfileWithAI } = require("../extract/extract.service");
const {
  ensureStudentFolder,
  uploadFileToDrive,
  deleteLocalFile,
} = require("../drive/drive.service");
const { upsertStudent } = require("../students/student.service");
const { prioritizeFields } = require("../extract/field-priority");
const Student = require("../../models/Student");

exports.handleUpload = async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Use aiKey from authenticated user (req.user.aiKey from auth middleware)
    const aiKey = req.user.aiKey;

    if (!aiKey) {
      return res
        .status(400)
        .json({ message: "Student aiKey not found in authentication" });
    }

    // 1) Extract profile using AI from uploaded files
    console.log("🤖 Starting AI extraction for", files.length, "files...");
    console.log(
      "📁 File objects:",
      files.map((f) => ({
        originalname: f.originalname,
        path: f.path,
        mimetype: f.mimetype,
        size: f.size,
      }))
    );
    const profile = await extractProfileWithAI(files);
    console.log(
      "✅ AI extraction completed:",
      Object.keys(profile).length,
      "fields extracted"
    );

    // 2) ensure/reuse Drive folder for this aiKey
    const folder = await ensureStudentFolder(aiKey);
    console.log("📁 Drive folder ready:", folder.webViewLink);

    // 3) upload each file into that folder
    const uploaded = [];
    for (const f of files) {
      console.log("📤 Uploading file:", f.originalname);
      const uploadedFile = await uploadFileToDrive(
        f.path,
        f.originalname,
        folder.id
      );
      uploaded.push(uploadedFile);
      deleteLocalFile(f.path);
    }
    console.log("✅ All files uploaded to Drive");

    // 4) upsert student with AI-extracted profile and drive info
    const normalizedDocuments = uploaded.map((file) => ({
      fileId: file.id,
      name: file.name || file.originalname,
      mimeType: file.mimeType || "application/octet-stream",
      webViewLink: file.webViewLink || "#",
      uploadedAt: new Date(),
    }));

    const student = await upsertStudent({
      aiKey,
      profile, // AI-extracted profile data
      drive: { folderId: folder.id, webViewLink: folder.webViewLink },
      documents: normalizedDocuments,
    });
    console.log("👤 Student record created/updated:", student.aiKey);

    res.json({
      message: `Successfully processed ${uploaded.length} files with AI and uploaded to Google Drive`,
      aiKey,
      driveFolder: folder.webViewLink,
      uploaded,
      student: {
        ...student.toObject(),
        profile: prioritizeFields(student.profile || {}),
      },
      extractedFields: Object.keys(profile).length,
      profile: prioritizeFields(profile), // Include the AI-extracted profile data with priority ordering
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
};
