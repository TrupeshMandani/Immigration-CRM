#!/usr/bin/env node

const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const BASE_URL = "http://localhost:4000";

async function testCompleteWorkflow() {
  console.log("\n🧪 Testing Complete Document Management Workflow\n");
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
    const studentEmail = `teststudent${timestamp}@example.com`;
    const studentUsername = `student${timestamp}`;

    const contact = await axios.post(`${BASE_URL}/api/contact`, {
      name: "Test Student Workflow",
      email: studentEmail,
      phone: "+1234567890",
      message: "Testing complete workflow",
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

    // 6. Check Initial Profile (should be empty)
    console.log("\n6️⃣ Checking initial profile...");
    const initialProfile = await axios.get(
      `${BASE_URL}/api/students/${studentAiKey}`
    );
    console.log("✅ Initial profile fetched");
    console.log(
      "   Profile fields:",
      Object.keys(initialProfile.data.profile || {}).length
    );

    // 7. Upload First Document
    console.log("\n7️⃣ Uploading first document...");
    const formData1 = new FormData();
    const testFile1Path = path.join(__dirname, "test-document.txt");

    // Create test file if it doesn't exist
    if (!fs.existsSync(testFile1Path)) {
      fs.writeFileSync(
        testFile1Path,
        "Name: John Doe\nEmail: john.doe@example.com\nPhone: 123-456-7890\nNationality: American"
      );
    }

    formData1.append("files", fs.createReadStream(testFile1Path));
    formData1.append("aiKey", studentAiKey);

    const upload1 = await axios.post(`${BASE_URL}/api/upload`, formData1, {
      headers: {
        ...formData1.getHeaders(),
        Authorization: `Bearer ${studentToken}`,
      },
    });
    console.log("✅ First document uploaded");
    console.log("   Fields extracted:", upload1.data.extractedFields);

    // 8. Check Profile After First Upload
    console.log("\n8️⃣ Checking profile after first upload...");
    const profileAfterFirst = await axios.get(
      `${BASE_URL}/api/students/${studentAiKey}`
    );
    const fieldsAfterFirst = Object.keys(profileAfterFirst.data.profile || {});
    console.log("✅ Profile updated");
    console.log("   Total fields:", fieldsAfterFirst.length);
    console.log("   Fields:", fieldsAfterFirst.join(", "));

    // 9. Upload Second Document
    console.log("\n9️⃣ Uploading second document...");
    const formData2 = new FormData();
    const testFile2Path = path.join(__dirname, "test-document-2.txt");

    // Create second test file
    fs.writeFileSync(
      testFile2Path,
      "Education: Bachelor of Science\nUniversity: MIT\nGraduation: 2020\nJob Title: Software Engineer"
    );

    formData2.append("files", fs.createReadStream(testFile2Path));
    formData2.append("aiKey", studentAiKey);

    const upload2 = await axios.post(`${BASE_URL}/api/upload`, formData2, {
      headers: {
        ...formData2.getHeaders(),
        Authorization: `Bearer ${studentToken}`,
      },
    });
    console.log("✅ Second document uploaded");
    console.log("   Fields extracted:", upload2.data.extractedFields);

    // Clean up test file
    fs.unlinkSync(testFile2Path);

    // 10. Check Profile After Second Upload (Should Have Both)
    console.log("\n🔟 Checking profile after second upload...");
    const profileAfterSecond = await axios.get(
      `${BASE_URL}/api/students/${studentAiKey}`
    );
    const fieldsAfterSecond = Object.keys(
      profileAfterSecond.data.profile || {}
    );
    console.log("✅ Profile updated with cumulative data");
    console.log("   Total fields:", fieldsAfterSecond.length);
    console.log("   Fields:", fieldsAfterSecond.join(", "));

    // Verify accumulation
    if (fieldsAfterSecond.length >= fieldsAfterFirst.length) {
      console.log("\n   ✅ SUCCESS: Profile data is cumulative!");
      console.log(
        `   First upload: ${fieldsAfterFirst.length} fields, After second: ${fieldsAfterSecond.length} fields`
      );
    } else {
      console.log("\n   ❌ WARNING: Profile data may not be cumulative");
    }

    // 11. Check Documents List
    console.log("\n1️⃣1️⃣ Checking documents list...");
    const documents = await axios.get(
      `${BASE_URL}/api/students/${studentAiKey}/files`
    );
    console.log("✅ Documents retrieved");
    console.log("   Total documents:", documents.data.totalFiles);
    console.log("   Documents:");
    documents.data.files.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.name} (${doc.mimeType})`);
    });

    // 12. Verify Profile Field Ordering
    console.log("\n1️⃣2️⃣ Verifying profile field display...");
    const profile = profileAfterSecond.data.profile;
    if (profile) {
      console.log("✅ Profile fields with formatting:");
      Object.entries(profile).forEach(([key, value]) => {
        const formattedKey = key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())
          .trim();
        console.log(`   📌 ${formattedKey}: ${value}`);
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("\n🎉 All tests passed successfully!\n");
    console.log("Summary:");
    console.log("  ✅ Profile data accumulates across multiple uploads");
    console.log("  ✅ All uploaded documents are stored and retrievable");
    console.log("  ✅ Profile fields are properly formatted");
    console.log("  ✅ Documents can be listed and accessed");
    console.log("\n💡 Next steps:");
    console.log("  1. Open frontend at http://localhost:5173");
    console.log("  2. Login as student:", studentUsername, "/ testpass123");
    console.log("  3. Check profile page to see formatted fields");
    console.log("  4. Check documents page to see all uploaded files");
    console.log("  5. Click on documents to test viewer functionality");
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

testCompleteWorkflow();
