const mongoose = require("mongoose");
const Admin = require("./backend/models/Admin");

async function testAdminLogin() {
  try {
    await mongoose.connect("mongodb://localhost:27017/student_records");
    console.log("✅ Connected to MongoDB");

    const admin = await Admin.findOne({ username: "admin" });
    console.log("Admin found:", !!admin);

    if (admin) {
      console.log("Testing password...");
      const isValid = await admin.comparePassword("admin123");
      console.log("Password valid:", isValid);

      if (isValid) {
        console.log("✅ Admin login should work!");
        console.log("Admin details:", {
          username: admin.username,
          email: admin.email,
          role: admin.role,
        });
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testAdminLogin();
