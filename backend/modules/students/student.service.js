const Student = require("../../models/Student");

/**
 * Upsert student by aiKey, merging profile/documents if provided.
 * data = { aiKey: string, profile?: object, documents?: object[] }
 */
async function upsertStudent(data) {
  console.log("🔍 upsertStudent called with:", data);

  const { aiKey, profile, documents } = data;

  if (typeof aiKey !== "string") {
    throw new Error("aiKey must be a string");
  }

  if (profile && typeof profile !== "object") {
    throw new Error("profile must be an object");
  }

  if (documents && !Array.isArray(documents)) {
    throw new Error("documents must be an array");
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

  if (documents && documents.length) {
    const normalizedDocs = documents.map((doc) => ({
      key: doc.key,
      bucket: doc.bucket,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : new Date(),
    }));

    const currentDocs = existing?.documents || [];
    const mergedMap = new Map();

    currentDocs.forEach((doc) => {
      const key = doc.key || doc.name;
      mergedMap.set(key, doc);
    });

    normalizedDocs.forEach((doc) => {
      const key = doc.key || doc.name;
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
