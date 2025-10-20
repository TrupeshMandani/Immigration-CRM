#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:4000";

async function testDocumentViewer() {
  console.log("\n🧪 Testing Document Viewer with Improved Messaging\n");
  console.log("=".repeat(60));

  try {
    // 1. Health Check
    console.log("\n1️⃣ Testing backend health...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Backend is healthy:", health.data);

    // 2. Admin Login
    console.log("\n2️⃣ Logging in as admin...");
    const adminLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: "admin1",
      password: "admin123123",
    });
    const adminToken = adminLogin.data.token;
    console.log("✅ Admin logged in successfully");

    // 3. Create Contact
    console.log("\n3️⃣ Creating test student via contact form...");
    const timestamp = Date.now();
    const studentEmail = `testviewer${timestamp}@example.com`;
    const studentUsername = `viewer${timestamp}`;

    const contact = await axios.post(`${BASE_URL}/api/contact`, {
      name: "Test Document Viewer",
      email: studentEmail,
      phone: "+1234567890",
      message: "Testing document viewer functionality",
    });
    const contactId = contact.data.contactId;
    console.log("✅ Contact created:", contactId);

    // 4. Activate Student
    console.log("\n4️⃣ Activating student account...");
    const activate = await axios.post(
      `${BASE_URL}/api/students/${contactId}/activate`,
      {
        username: studentUsername,
        password: "testpass123",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const studentAiKey = activate.data.student.aiKey;
    console.log("✅ Student activated with aiKey:", studentAiKey);

    // 5. Student Login
    console.log("\n5️⃣ Logging in as student...");
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: studentUsername,
      password: "testpass123",
    });
    const studentToken = studentLogin.data.token;
    console.log("✅ Student logged in successfully");

    // 6. Upload Test Document
    console.log("\n6️⃣ Uploading test document...");
    const FormData = require("form-data");
    const fs = require("fs");
    const path = require("path");

    const formData = new FormData();
    const testFilePath = path.join(__dirname, "test-document.txt");

    // Create test file if it doesn't exist
    if (!fs.existsSync(testFilePath)) {
      fs.writeFileSync(
        testFilePath,
        "Name: Document Viewer Test\nEmail: test@example.com\nPhone: 123-456-7890\nStatus: Testing document viewer"
      );
    }

    formData.append("files", fs.createReadStream(testFilePath));
    formData.append("aiKey", studentAiKey);

    const upload = await axios.post(`${BASE_URL}/api/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${studentToken}`,
      },
    });
    console.log("✅ Document uploaded successfully");

    // 7. Check Documents List
    console.log("\n7️⃣ Checking documents list...");
    const documents = await axios.get(
      `${BASE_URL}/api/students/${studentAiKey}/files`
    );
    console.log("✅ Documents retrieved");
    console.log("   Total documents:", documents.data.totalFiles);

    if (documents.data.files.length > 0) {
      const doc = documents.data.files[0];
      console.log("\n📄 Document Details:");
      console.log(`   Name: ${doc.name}`);
      console.log(`   Type: ${doc.mimeType}`);
      console.log(
        `   Uploaded: ${
          doc.uploadedAt
            ? new Date(doc.uploadedAt).toLocaleDateString()
            : "Unknown"
        }`
      );
      console.log(`   Drive Link: ${doc.webViewLink}`);

      if (doc.webViewLink === "#") {
        console.log("\n   📋 Expected Behavior:");
        console.log(
          "   - Document viewer will show 'Document Stored Successfully'"
        );
        console.log("   - Will display document information");
        console.log("   - Will show 'Preview Pending' in header");
        console.log("   - Will explain Google Drive setup needed");
      } else {
        console.log("\n   📋 Expected Behavior:");
        console.log("   - Document viewer will show preview");
        console.log("   - Will have 'Open in Drive' button");
        console.log("   - Will allow download");
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 Document viewer test completed!\n");
    console.log("Next steps:");
    console.log("1. Open frontend: http://localhost:5173");
    console.log(`2. Login as student: ${studentUsername} / testpass123`);
    console.log("3. Go to Documents page");
    console.log("4. Click on the uploaded document");
    console.log("5. Verify the improved messaging:");
    console.log("   - Should show 'Document Stored Successfully'");
    console.log("   - Should display document information");
    console.log("   - Should explain Google Drive setup");
    console.log("   - Should NOT show 'Preview not available' error");
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data || error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error(
        "Response data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    process.exit(1);
  }
}

testDocumentViewer();
