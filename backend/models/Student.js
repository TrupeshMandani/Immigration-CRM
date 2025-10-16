const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const studentSchema = new mongoose.Schema(
  {
    aiKey: { type: String, unique: true, index: true }, // internal invisible ID
    profile: { type: mongoose.Schema.Types.Mixed }, // any JSON structure
    drive: {
      folderId: String,
      webViewLink: String,
    },
    // Authentication fields
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null values
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    role: {
      type: String,
      default: "student",
      enum: ["student"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "active", "inactive"],
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },
    contactInfo: {
      name: String,
      email: String,
      phone: String,
      message: String,
    },
  },
  { timestamps: true }
);

// Hash password before saving
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
studentSchema.methods.toJSON = function () {
  const student = this.toObject();
  delete student.password;
  return student;
};

module.exports = mongoose.model("Student", studentSchema);
