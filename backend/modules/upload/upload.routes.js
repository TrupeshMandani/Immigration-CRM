const express = require('express');
const router = express.Router();
const { upload } = require('./upload.service');
const { handleUpload } = require('./upload.controller');

// POST /api/upload
router.post('/', upload.array('files', 20), handleUpload);

module.exports = router;
