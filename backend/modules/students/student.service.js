const Student = require("../../models/Student");

/**
 * Upsert student by aiKey, merging profile/drive if provided.
 * data = { aiKey: string, profile?: object, drive?: object }
 */
async function upsertStudent(data) {
  const { aiKey, profile, drive, documents } = data;

  if (typeof aiKey !== "string") {
    throw new Error("aiKey must be a string");
  }

  const existing = await Student.findOne({ aiKey });

  const update = { aiKey };

  if (profile && Object.keys(profile).length) {
    const existingProfile = existing?.profile || {};
    const mergedProfile = { ...existingProfile, ...profile };
    update.profile = mergedProfile;

    console.log(`🔄 Profile merge for ${aiKey}:`);
    console.log(`   - Existing fields: ${Object.keys(existingProfile).length}`);
    console.log(`   - New fields: ${Object.keys(profile).length}`);
    console.log(
      `   - Total fields after merge: ${Object.keys(mergedProfile).length}`
    );
  }

  if (drive) {
    update.drive = drive;
  }

  if (documents && documents.length) {
    const normalizedDocs = documents.map((doc) => ({
      fileId: doc.id || doc.fileId || doc.googleFileId || doc.name,
      name: doc.name || doc.originalName || "Document",
      mimeType: doc.mimeType || doc.type || "application/octet-stream",
      webViewLink: doc.webViewLink || doc.url || "#",
      uploadedAt: doc.uploadedAt
        ? new Date(doc.uploadedAt)
        : doc.modifiedTime
        ? new Date(doc.modifiedTime)
        : new Date(),
    }));

    const currentDocs = existing?.documents || [];
    const mergedMap = new Map();

    currentDocs.forEach((doc) => {
      const key = doc.fileId || doc.name;
      mergedMap.set(key, doc);
    });

    normalizedDocs.forEach((doc) => {
      const key = doc.fileId || doc.name;
      mergedMap.set(key, { ...mergedMap.get(key), ...doc });
    });

    update.documents = Array.from(mergedMap.values());
  }

  const student = await Student.findOneAndUpdate(
    { aiKey },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return student;
}

module.exports = { upsertStudent };
