const Student = require("../../models/Student");
const { google } = require("googleapis");
const { getDriveClient } = require("../drive/drive.service"); // export it if not yet

// list all students (admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { "contactInfo.name": { $regex: search, $options: "i" } },
        { "contactInfo.email": { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }

    const list = await Student.find(query).sort({ _id: -1 });
    res.json(list);
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Failed to get students" });
  }
};

// get pending contact requests (admin only)
exports.getPendingContacts = async (req, res) => {
  try {
    const pending = await Student.find({ status: "pending" }).sort({ _id: -1 });
    res.json(pending);
  } catch (error) {
    console.error("Get pending contacts error:", error);
    res.status(500).json({ message: "Failed to get pending contacts" });
  }
};

// activate student account (admin only)
exports.activateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.status !== "pending") {
      return res.status(400).json({ message: "Student is not pending" });
    }

    // Update student with credentials
    student.username = username;
    student.password = password;
    student.status = "active";
    student.email = student.contactInfo.email; // Use contact email as login email

    await student.save();

    res.json({
      message: "Student account activated successfully",
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        contactInfo: student.contactInfo,
      },
    });
  } catch (error) {
    console.error("Activate student error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }
    res.status(500).json({ message: "Failed to activate student" });
  }
};

// single student
exports.getStudentByKey = async (req, res) => {
  const student = await Student.findOne({ aiKey: req.params.aiKey });
  if (!student) return res.status(404).json({ message: "Not found" });
  res.json(student);
};

// get student by ID (admin only)
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.json(student);
  } catch (error) {
    console.error("Get student error:", error);
    res.status(500).json({ message: "Failed to get student" });
  }
};

// update student (admin only)
exports.updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const student = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update student error:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

// delete student (admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Delete student error:", error);
    res.status(500).json({ message: "Failed to delete student" });
  }
};

// list Drive files
exports.getStudentFiles = async (req, res) => {
  const student = await Student.findOne({ aiKey: req.params.aiKey });
  if (!student?.drive?.folderId)
    return res.status(404).json({ message: "No Drive folder" });

  const drive = getDriveClient();
  const result = await drive.files.list({
    q: `'${student.drive.folderId}' in parents and trashed=false`,
    fields: "files(id,name,webViewLink,modifiedTime)",
  });

  res.json({ folder: student.drive.folderLink, files: result.data.files });
};
