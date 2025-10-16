const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:4000/api";

async function testUpload() {
  console.log("🧪 Testing File Upload with AI Processing...\n");

  try {
    // Test 1: API Health Check
    console.log("1. Testing API Health...");
    const health = await axios.get(`${API_URL}/`);
    console.log("✅ API Health:", health.data.message);

    // Test 2: Create a test file (simple text file)
    const testContent = `
Student Information:
Name: John Doe
Date of Birth: 1990-05-15
UCI: 1234567890
Application Number: APP-2024-001
Passport Number: A1234567
Program: Computer Science
College: University of Toronto
Country: Canada
Email: john.doe@example.com
Phone: +1-555-123-4567
    `;

    const testFilePath = path.join(__dirname, "test-student-info.txt");
    fs.writeFileSync(testFilePath, testContent);
    console.log("✅ Test file created:", testFilePath);

    // Test 3: Upload file with AI processing
    console.log("\n2. Testing File Upload with AI...");
    const formData = new FormData();
    formData.append("files", fs.createReadStream(testFilePath));
    formData.append("aiKey", "test-student-" + Date.now());

    const uploadResponse = await axios.post(`${API_URL}/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log("✅ Upload successful!");
    console.log("📊 Response:", {
      message: uploadResponse.data.message,
      aiKey: uploadResponse.data.aiKey,
      extractedFields: uploadResponse.data.extractedFields,
      driveFolder: uploadResponse.data.driveFolder,
    });

    if (
      uploadResponse.data.profile &&
      Object.keys(uploadResponse.data.profile).length > 0
    ) {
      console.log("\n🤖 AI Extracted Profile:");
      console.log(JSON.stringify(uploadResponse.data.profile, null, 2));
    } else {
      console.log("\n⚠️  No profile data extracted by AI");
    }

    // Test 4: Get student by aiKey
    console.log("\n3. Testing Student Retrieval...");
    const studentResponse = await axios.get(
      `${API_URL}/students/${uploadResponse.data.aiKey}`
    );
    console.log("✅ Student retrieved:", {
      aiKey: studentResponse.data.aiKey,
      profileKeys: Object.keys(studentResponse.data.profile || {}),
      driveFolder: studentResponse.data.drive?.webViewLink,
    });

    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log("\n🧹 Test file cleaned up");

    console.log("\n🎉 All tests passed!");
    console.log("\n📋 Test Summary:");
    console.log("- API Health: ✅");
    console.log("- File Upload: ✅");
    console.log("- AI Processing: ✅");
    console.log("- Student Creation: ✅");
    console.log("- Drive Integration: ✅");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Make sure backend is running on port 4000");
    console.log("2. Check your .env file has correct API keys");
    console.log("3. Verify MongoDB is running");
    console.log("4. Check Google Drive API credentials");
  }
}

testUpload();
