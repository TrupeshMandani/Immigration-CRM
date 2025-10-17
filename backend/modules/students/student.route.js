const express = require("express");
const router = express.Router();
const ctrl = require("./student.controller");
const {
  authenticateToken,
  requireAdmin,
  requireStudent,
} = require("../../middleware/auth");

// Public routes (for students to access their own data)
router.get("/:aiKey", ctrl.getStudentByKey);
router.get("/:aiKey/files", ctrl.getStudentFiles);

// Admin-only routes
router.post("/", authenticateToken, requireAdmin, ctrl.createStudent);
router.get("/", authenticateToken, requireAdmin, ctrl.getAllStudents);
router.get(
  "/pending/contacts",
  authenticateToken,
  requireAdmin,
  ctrl.getPendingContacts
);
router.get("/admin/:id", authenticateToken, requireAdmin, ctrl.getStudentById);
router.post(
  "/:id/approve-contact",
  authenticateToken,
  requireAdmin,
  ctrl.approveContactRequest
);
router.post(
  "/:id/activate",
  authenticateToken,
  requireAdmin,
  ctrl.activateStudent
);
router.put("/:id", authenticateToken, requireAdmin, ctrl.updateStudent);
router.delete("/:id", authenticateToken, requireAdmin, ctrl.deleteStudent);

module.exports = router;
