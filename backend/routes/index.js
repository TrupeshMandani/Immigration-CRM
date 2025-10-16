const express = require("express");
const router = express.Router();

router.use("/upload", require("../modules/upload/upload.routes"));

router.get("/", (req, res) => res.json({ message: "API root ready" }));

// Auth routes
router.use("/auth", require("../modules/auth/auth.route"));

// Contact routes
router.use("/contact", require("../modules/contact/contact.route"));

// Student routes
router.use("/students", require("../modules/students/student.route"));

module.exports = router;
