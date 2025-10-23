const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

const BASE_URL = "http://localhost:4000/api";

async function testS3Workflow() {
  console.log("\n🧪 Testing S3 Document Workflow\n");

  try {
    // 1. Admin login
    console.log("1️⃣ Admin login...");
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: "admin1",
      password: "admin123123",
    });
    const adminToken = adminLogin.data.token;
    console.log("✅ Admin logged in");

    // 2. Create student
    console.log("\n2️⃣ Creating student contact...");
    const contactData = {
      name: `Test Student ${Date.now()}`,
      email: `student${Date.now()}@test.com`,
      phone: "1234567890",
      message: "S3 Test",
    };
    const contact = await axios.post(`${BASE_URL}/contact`, contactData);
    console.log("✅ Contact created:", contact.data.contactId);

    // 3. Activate student
    console.log("\n3️⃣ Activating student...");
    const activateData = {
      password: "testpass123",
    };
    const activated = await axios.post(
      `${BASE_URL}/students/${contact.data.contactId}/activate`,
      activateData,
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    const { aiKey, username } = activated.data.student;
    console.log("✅ Student activated. aiKey:", aiKey);
    console.log("   Generated username:", username);

    // 4. Student login
    console.log("\n4️⃣ Student login...");
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: username,
      password: activateData.password,
    });
    const studentToken = studentLogin.data.token;
    console.log("✅ Student logged in");

    // 5. Upload document
    console.log("\n5️⃣ Uploading document to S3...");
    const formData = new FormData();
    formData.append("files", fs.createReadStream("test-document.txt"));

    try {
      const upload = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${studentToken}`,
        },
      });
      console.log("✅ Document uploaded");
      console.log("   Extracted fields:", upload.data.extractedFields);
      console.log("   Profile data:", Object.keys(upload.data.profile));
    } catch (uploadError) {
      console.error(
        "❌ Upload failed:",
        uploadError.response?.data || uploadError.message
      );
      throw uploadError;
    }

    // 6. Fetch documents
    console.log("\n6️⃣ Fetching documents...");
    const docs = await axios.get(`${BASE_URL}/students/${aiKey}/files`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log("✅ Retrieved", docs.data.totalFiles, "documents");

    if (docs.data.files.length > 0) {
      const firstDoc = docs.data.files[0];
      console.log("\n   First document:");
      console.log("   - Name:", firstDoc.name);
      console.log("   - S3 Key:", firstDoc.key);
      console.log("   - Has URL:", !!firstDoc.url);
      console.log("   - URL expires in ~1 hour");
    }

    console.log("\n✅ S3 WORKFLOW TEST COMPLETE\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error.response?.data || error.message);
  }
}

testS3Workflow();
