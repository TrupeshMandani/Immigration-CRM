const mongoose = require("mongoose");
const Admin = require("./backend/models/Admin");

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/student_records");
    console.log("Connected to MongoDB");

    // Check if admin exists
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.username);
      console.log("You can login with:");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      return;
    }

    // Create new admin
    const admin = new Admin({
      username: "admin",
      email: "admin@immigrationcrm.com",
      password: "admin123",
    });

    await admin.save();
    console.log("✅ Admin created successfully!");
    console.log("Username: admin");
    console.log("Email: admin@immigrationcrm.com");
    console.log("Password: admin123");
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();
