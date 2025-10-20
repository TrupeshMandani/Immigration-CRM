const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:4000";

async function testSimpleUpload() {
  console.log("🧪 Testing Simple Upload...\n");

  try {
    // 1. Login as admin
    console.log("1️⃣ Logging in as admin...");
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: "admin1",
      password: "admin123123",
    });
    console.log("✅ Admin login successful");

    // 2. Create a simple test file
    console.log("\n2️⃣ Creating test file...");
    const testFilePath = path.join(__dirname, "simple-test.txt");
    fs.writeFileSync(
      testFilePath,
      "This is a simple test file for upload testing."
    );
    console.log("✅ Test file created");

    // 3. Test upload endpoint directly
    console.log("\n3️⃣ Testing upload endpoint...");
    const formData = new FormData();
    formData.append("files", fs.createReadStream(testFilePath));
    formData.append("aiKey", "test-key-123");

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${loginResponse.data.token}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log("✅ Upload successful!");
    console.log("📊 Response:", uploadResponse.data);

    // Clean up
    fs.unlinkSync(testFilePath);
    console.log("✅ Test file cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    if (error.code === "ECONNRESET" || error.code === "EPIPE") {
      console.log("🔧 This might be a network/connection issue");
    }
  }
}

testSimpleUpload();

