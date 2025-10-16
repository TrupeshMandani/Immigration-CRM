const mongoose = require("mongoose");
const Admin = require("./backend/models/Admin");

async function createAdmin1() {
  try {
    await mongoose.connect("mongodb://localhost:27017/student_records");
    console.log("✅ Connected to MongoDB");

    // Check if admin1 exists
    let admin1 = await Admin.findOne({ username: "admin1" });

    if (admin1) {
      console.log("Admin1 already exists, deleting it...");
      await Admin.deleteOne({ username: "admin1" });
    }

    // Create new admin using the model
    admin1 = new Admin({
      username: "admin1",
      email: "admin1@immigrationcrm.com",
      password: "admin123123",
      role: "admin",
      isActive: true,
    });

    await admin1.save();

    console.log("✅ Admin1 created successfully using Mongoose model!");
    console.log("Username: admin1");
    console.log("Email: admin1@immigrationcrm.com");
    console.log("Password: admin123123");

    // Test password
    const isValid = await admin1.comparePassword("admin123123");
    console.log("Password verification test:", isValid);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Error:", error.message);
    await mongoose.disconnect();
  }
}

createAdmin1();
