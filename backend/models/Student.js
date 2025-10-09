
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    aiKey: { type: String, unique: true, index: true }, // internal invisible ID
    profile: { type: mongoose.Schema.Types.Mixed },     // any JSON structure
    drive: {
      folderId: String,
      webViewLink: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);

