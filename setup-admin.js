const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Simple admin creation without mongoose models
async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://localhost:27017/student_records");
    console.log("✅ Connected to MongoDB");

    // Check if admin collection exists and has data
    const db = mongoose.connection.db;
    const adminCollection = db.collection("admins");
    const existingAdmin = await adminCollection.findOne();

    if (existingAdmin) {
      console.log("✅ Admin already exists:");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
      console.log("You can login with these credentials!");
    } else {
      // Create admin manually
      const hashedPassword = await bcrypt.hash("admin123", 10);

      const admin = {
        username: "admin",
        email: "admin@immigrationcrm.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminCollection.insertOne(admin);
      console.log("✅ Admin created successfully!");
      console.log("Username: admin");
      console.log("Email: admin@immigrationcrm.com");
      console.log("Password: admin123");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();

