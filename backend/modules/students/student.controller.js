const Student = require('../../models/Student');
const { google } = require('googleapis');
const { getDriveClient } = require('../drive/drive.service'); // export it if not yet

// list all
exports.getAllStudents = async (req, res) => {
  const list = await Student.find().sort({ _id: -1 });
  res.json(list);
};

// single student
exports.getStudentByKey = async (req, res) => {
  const student = await Student.findOne({ aiKey: req.params.aiKey });
  if (!student) return res.status(404).json({ message: 'Not found' });
  res.json(student);
};

// list Drive files
exports.getStudentFiles = async (req, res) => {
  const student = await Student.findOne({ aiKey: req.params.aiKey });
  if (!student?.drive?.folderId)
    return res.status(404).json({ message: 'No Drive folder' });

  const drive = getDriveClient();
  const result = await drive.files.list({
    q: `'${student.drive.folderId}' in parents and trashed=false`,
    fields: 'files(id,name,webViewLink,modifiedTime)',
  });

  res.json({ folder: student.drive.folderLink, files: result.data.files });
};
