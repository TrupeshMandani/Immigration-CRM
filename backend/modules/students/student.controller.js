const crypto = require("crypto");
const Student = require("../../models/Student");
const Admin = require("../../models/Admin");
const { google } = require("googleapis");
const { getDriveClient } = require("../drive/drive.service");
const { sendEmail } = require("../../utils/sendEmail");
const { APP_BASE_URL } = require("../../config/env");

const createTempPassword = () => {
  let candidate = "";
  while (candidate.length < 10) {
    candidate = crypto
      .randomBytes(16)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);
  }
  return candidate;
};

const buildApprovalEmail = ({ name, username, password }) => {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hello,";

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
      <h2 style="color:#1d4ed8;">${greeting}</h2>
      <p>Your access to the Immigration CRM student dashboard has been approved. Use the credentials below to sign in and review your case details.</p>
      <div style="background:#eff6ff; border-radius:8px; padding:16px; margin:24px 0;">
        <p style="margin:0;"><strong>Portal:</strong> <a href="${APP_BASE_URL}/login" style="color:#1d4ed8;">${APP_BASE_URL}/login</a></p>
        <p style="margin:8px 0 0 0;"><strong>Username:</strong> ${username}</p>
        <p style="margin:8px 0 0 0;"><strong>Temporary Password:</strong> ${password}</p>
      </div>
      <div style="margin-bottom:24px; padding:12px 16px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px;">
        <p style="margin:0; color:#92400e;">
          This password is temporary. You will be asked to create a new password immediately after your first login.
        </p>
      </div>
      <p>For security, do not share these credentials with anyone.</p>
      <p>If you did not request this access or have any questions, please contact our support team.</p>
      <p style="margin-top:32px;">Best regards,<br/>Immigration CRM Team</p>
    </div>
  `;
};

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

// approve contact request (admin only)
exports.approveContactRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Contact request not found" });
    }

    if (student.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This contact has already been processed" });
    }

    const contactEmail = student.contactInfo?.email;
    if (!contactEmail) {
      return res
        .status(400)
        .json({ message: "Contact request is missing an email address" });
    }

    const username = contactEmail.toLowerCase();

    const existingStudent = await Student.findOne({
      _id: { $ne: student._id },
      $or: [{ username }, { email: username }],
      status: { $ne: "inactive" },
    });

    if (existingStudent) {
      return res.status(400).json({
        message:
          "Another student already uses this email. Update or remove the existing account first.",
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ username }, { email: username }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message:
          "An administrator account already uses this email. Choose a different email before approving.",
      });
    }

    const tempPassword = createTempPassword();

    student.username = username;
    student.email = username;
    student.password = tempPassword;
    student.status = "active";
    student.isFirstLogin = true;
    if (student.contactInfo) {
      student.contactInfo.approvedAt = new Date();
    }

    await student.save();

    try {
      await sendEmail({
        to: username,
        subject: "Your Immigration CRM portal access",
        html: buildApprovalEmail({
          name: student.contactInfo?.name,
          username,
          password: tempPassword,
        }),
      });
    } catch (emailError) {
      // Rollback activation if email fails to send
      student.username = undefined;
      student.email = undefined;
      student.password = undefined;
      student.status = "pending";
      student.isFirstLogin = true;
      if (student.contactInfo) {
        delete student.contactInfo.approvedAt;
      }
      await student.save();
      throw emailError;
    }

    res.json({
      message: "Contact approved and email with credentials sent successfully.",
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        contactInfo: student.contactInfo,
      },
      tempPassword,
    });
  } catch (error) {
    console.error("Approve contact request error:", error);
    res.status(500).json({
      message:
        error.message || "Failed to approve contact request. Please try again.",
    });
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
        aiKey: student.aiKey,
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

// create student (admin only)
exports.createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      status = "active",
      profile = {},
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = normalizedEmail;

    const existingStudent = await Student.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
        { "contactInfo.email": normalizedEmail },
      ],
    });

    if (existingStudent) {
      return res.status(400).json({
        message: "A student with this email or username already exists",
      });
    }

    const existingAdmin = await Admin.findOne({
      $or: [{ email: normalizedEmail }, { username: normalizedUsername }],
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: "An admin already uses this email or username",
      });
    }

    const tempPassword = createTempPassword();

    const student = new Student({
      aiKey: `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: ["active", "pending", "inactive"].includes(status)
        ? status
        : "active",
      username: normalizedUsername,
      email: normalizedEmail,
      password: tempPassword,
      isFirstLogin: true,
      profile,
      contactInfo: {
        name,
        email: normalizedEmail,
        phone,
        message,
      },
    });

    await student.save();

    try {
      await sendEmail({
        to: normalizedEmail,
        subject: "Your Immigration CRM account",
        html: buildApprovalEmail({
          name,
          username: normalizedUsername,
          password: tempPassword,
        }),
      });
    } catch (emailError) {
      console.error("Failed to send student welcome email:", emailError);
    }

    try {
      await sendEmail({
        to: ADMIN_NOTIFICATIONS_EMAIL || normalizedEmail,
        subject: "Student account created",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
            <h2 style="color:#1d4ed8;margin-bottom:12px;">New student created</h2>
            <p style="margin:0 0 16px 0;">
              ${name} (${normalizedEmail}) has been added and the welcome email was sent.
            </p>
          </div>
        `,
      });
    } catch (notifyError) {
      console.error("Failed to send admin notification email:", notifyError);
    }

    res.status(201).json({
      message: "Student created successfully",
      student: {
        id: student._id,
        username: student.username,
        email: student.email,
        status: student.status,
      },
    });
  } catch (error) {
    console.error("Create student error:", error);
    res.status(500).json({ message: "Failed to create student" });
  }
};

// list Drive files
exports.getStudentFiles = async (req, res) => {
  try {
    const student = await Student.findOne({ aiKey: req.params.aiKey });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Return documents from student model's documents array
    const documents = student.documents || [];

    console.log(
      `📁 Fetching files for student ${req.params.aiKey}: ${documents.length} documents found`
    );

    res.json({
      folder: student.drive?.webViewLink || null,
      files: documents,
      totalFiles: documents.length,
    });
  } catch (error) {
    console.error("Get student files error:", error);
    res.status(500).json({ error: "Failed to retrieve documents" });
  }
};
