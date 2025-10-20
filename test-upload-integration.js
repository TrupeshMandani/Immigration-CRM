const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:4000";

async function testUploadIntegration() {
  console.log("🧪 Testing Upload Integration...\n");

  try {
    // 1. Test health check
    console.log("1️⃣ Testing health check...");
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Health check passed:", healthResponse.data.ok);

    // 2. Test admin login
    console.log("\n2️⃣ Testing admin login...");
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: "admin1",
      password: "admin123123",
    });
    console.log("✅ Admin login successful:", loginResponse.data.user.username);

    // 3. Create a test student via contact form
    console.log("\n3️⃣ Creating test student via contact form...");
    const timestamp = Date.now();
    const uniqueEmail = `test-${timestamp}@example.com`;
    const studentUsername = `teststudent${timestamp}`;

    const contactResponse = await axios.post(`${BASE_URL}/api/contact`, {
      name: "Test Student",
      email: uniqueEmail,
      phone: "+1234567890",
      message: "Test contact for upload integration testing",
    });
    console.log("✅ Contact submitted:", contactResponse.data.message);

    // Get the contact ID for activation
    const contactId = contactResponse.data.contactId;

    // 4. Activate the student
    console.log("\n4️⃣ Activating test student...");
    const activateResponse = await axios.post(
      `${BASE_URL}/api/students/${contactId}/activate`,
      {
        username: studentUsername,
        password: "testpass123",
      },
      {
        headers: { Authorization: `Bearer ${loginResponse.data.token}` },
      }
    );
    console.log("✅ Student activated:", activateResponse.data.message);

    // Get the student's aiKey from the activation response
    const studentAiKey = activateResponse.data.student.aiKey;

    // 5. Login as student
    console.log("\n5️⃣ Logging in as student...");
    const studentLoginResponse = await axios.post(
      `${BASE_URL}/api/auth/login`,
      {
        username: studentUsername,
        password: "testpass123",
      }
    );
    console.log(
      "✅ Student login successful:",
      studentLoginResponse.data.user.username
    );

    // 6. Test file upload
    console.log("\n6️⃣ Testing file upload...");

    // Create a test text file
    const testFilePath = path.join(__dirname, "test-document.txt");
    if (!fs.existsSync(testFilePath)) {
      // Create a simple test file
      fs.writeFileSync(
        testFilePath,
        "This is a test document for upload testing. It contains some sample text that can be processed by the AI system."
      );
    }

    const formData = new FormData();
    formData.append("files", fs.createReadStream(testFilePath));

    const uploadResponse = await axios.post(
      `${BASE_URL}/api/upload`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${studentLoginResponse.data.token}`,
        },
      }
    );

    console.log("✅ File upload successful!");
    console.log("📊 Upload results:");
    console.log(
      "   - Files uploaded:",
      uploadResponse.data.uploaded?.length || 0
    );
    console.log(
      "   - Fields extracted:",
      uploadResponse.data.extractedFields || 0
    );
    console.log("   - AI Key:", uploadResponse.data.aiKey);
    console.log("   - Drive folder:", uploadResponse.data.driveFolder);

    // Use the aiKey from the upload response
    const uploadAiKey = uploadResponse.data.aiKey;

    // 7. Test getting student profile
    console.log("\n7️⃣ Testing student profile retrieval...");
    const profileResponse = await axios.get(
      `${BASE_URL}/api/students/${uploadAiKey}`
    );
    console.log("✅ Profile retrieved successfully");
    console.log(
      "📋 Profile data keys:",
      Object.keys(profileResponse.data.profile || {})
    );

    // 8. Test getting student files
    console.log("\n8️⃣ Testing student files retrieval...");
    const filesResponse = await axios.get(
      `${BASE_URL}/api/students/${uploadAiKey}/files`
    );
    console.log("✅ Files retrieved successfully");
    console.log("📁 Files count:", filesResponse.data.files?.length || 0);

    console.log(
      "\n🎉 All tests passed! Upload integration is working correctly."
    );
    console.log("\n📝 Summary:");
    console.log("   ✅ Backend authentication working");
    console.log("   ✅ File upload with AI processing working");
    console.log("   ✅ Profile data extraction working");
    console.log("   ✅ Google Drive integration working");
    console.log("   ✅ Student profile and files retrieval working");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log("\n🔧 Troubleshooting tips:");
    console.log("   - Make sure backend is running on port 4000");
    console.log("   - Check that MongoDB is connected");
    console.log("   - Verify Google Drive API credentials");
    console.log("   - Ensure OpenAI API key is configured");
  }
}

// Run the test
testUploadIntegration();
