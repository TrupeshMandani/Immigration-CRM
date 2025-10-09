const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  aiKey: { type: String, index: true },           // unique student identifier
  originalName: String,
  storedName: String,
  mimeType: String,
  size: Number,
  path: String,
  status: { type: String, default: 'UPLOADED' },  // later: EXTRACTED, DRIVE_UPLOADED
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
