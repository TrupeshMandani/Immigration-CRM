const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

async function registerNewAdmin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/student_records");
    console.log("✅ Connected to MongoDB");

    // Check if admin1 already exists
    const db = mongoose.connection.db;
    const adminCollection = db.collection("admins");
    const existingAdmin = await adminCollection.findOne({ username: "admin1" });

    if (existingAdmin) {
      console.log("✅ Admin1 already exists:");
      console.log("Username:", existingAdmin.username);
      console.log("Email:", existingAdmin.email);
    } else {
      // Create new admin
      const hashedPassword = await bcrypt.hash("admin123123", 10);

      const admin = {
        username: "admin1",
        email: "admin1@immigrationcrm.com",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await adminCollection.insertOne(admin);
      console.log("✅ Admin1 created successfully!");
      console.log("Username: admin1");
      console.log("Email: admin1@immigrationcrm.com");
      console.log("Password: admin123123");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

registerNewAdmin();
