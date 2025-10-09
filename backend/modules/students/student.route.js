const express = require('express');
const router = express.Router();
const ctrl = require('./student.controller');

router.get('/', ctrl.getAllStudents);
router.get('/:aiKey', ctrl.getStudentByKey);
router.get('/:aiKey/files', ctrl.getStudentFiles);

module.exports = router;
