const express = require('express');
const router = express.Router();

router.use('/upload', require('../modules/upload/upload.routes'));

router.get('/', (req, res) => res.json({ message: 'API root ready' }));

router.use('/students', require('../modules/students/student.route'));

module.exports = router;
