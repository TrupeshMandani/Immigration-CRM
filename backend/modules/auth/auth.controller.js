const jwt = require("jsonwebtoken");
const Admin = require("../../models/Admin");
const Student = require("../../models/Student");

console.log("🔧 AUTH CONTROLLER LOADED");

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      username: user.username,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || "7d" }
  );
};

// Login for both admin and student
exports.login = async (req, res) => {
  console.log("🚀 LOGIN FUNCTION CALLED");
  try {
    const { username, password } = req.body;
    console.log("🔐 Login attempt:", { username, hasPassword: !!password });

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    // Try to find user in both Admin and Student collections
    console.log("🔍 Searching for admin with username:", username);
    let user = await Admin.findOne({
      $or: [{ username }, { email: username }],
    });
    console.log("🔍 Admin search result:", user ? "Found" : "Not found");
    if (user) {
      console.log("🔍 Found admin:", {
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }

    if (!user) {
      user = await Student.findOne({
        $or: [{ username }, { email: username }],
        status: "active", // Only active students can login
      });
      console.log("🔍 Student search result:", user ? "Found" : "Not found");
    }

    if (!user) {
      console.log("❌ No user found");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        aiKey: user.aiKey, // for students
        isFirstLogin: user.isFirstLogin, // for students
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.isFirstLogin = false; // Mark as no longer first login
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// Register first admin (one-time setup)
exports.registerAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = new Admin({
      username,
      email,
      password,
    });

    await admin.save();

    const token = generateToken(admin);

    res.status(201).json({
      message: "Admin created successfully",
      token,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }
    res.status(500).json({ message: "Failed to create admin" });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      aiKey: user.aiKey, // for students
      isFirstLogin: user.isFirstLogin, // for students
      profile: user.profile, // for students
      contactInfo: user.contactInfo, // for students
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
  }
};
