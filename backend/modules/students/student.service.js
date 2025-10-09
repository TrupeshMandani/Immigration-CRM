const Student = require('../../models/Student');

/**
 * Upsert student by aiKey, merging profile/drive if provided.
 * data = { aiKey: string, profile?: object, drive?: object }
 */
async function upsertStudent(data) {
  const { aiKey, profile, drive } = data;

  if (typeof aiKey !== 'string') {
    throw new Error('aiKey must be a string');
  }

  const $set = { aiKey };
  if (profile && Object.keys(profile).length) $set.profile = profile;
  if (drive) $set.drive = drive;

  const student = await Student.findOneAndUpdate(
    { aiKey },            // filter
    { $set },             // update
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return student;
}

module.exports = { upsertStudent };
