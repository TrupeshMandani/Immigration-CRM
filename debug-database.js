const axios = require("axios");

const BASE_URL = "http://localhost:4000/api";

async function debugDatabase() {
  console.log("🔍 Debugging Database Contents\n");

  try {
    // 1. Admin login
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      username: "admin1",
      password: "admin123123",
    });
    const adminToken = adminLogin.data.token;
    console.log("✅ Admin logged in");

    // 2. Get all students
    const students = await axios.get(`${BASE_URL}/students`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    console.log(`\n📊 Found ${students.data.length} students`);

    // Find the most recent student
    const recentStudent = students.data[students.data.length - 1];
    console.log("\n🔍 Most recent student:");
    console.log("   - aiKey:", recentStudent.aiKey);
    console.log("   - Username:", recentStudent.username);
    console.log("   - Documents count:", recentStudent.documents?.length || 0);

    if (recentStudent.documents && recentStudent.documents.length > 0) {
      console.log("\n📄 Document details:");
      recentStudent.documents.forEach((doc, index) => {
        console.log(`   Document ${index + 1}:`);
        console.log("     - Name:", doc.name);
        console.log("     - Key:", doc.key);
        console.log("     - Bucket:", doc.bucket);
        console.log("     - MimeType:", doc.mimeType);
        console.log("     - Size:", doc.size);
        console.log("     - UploadedAt:", doc.uploadedAt);
      });
    }

    // 3. Try to get files for this student
    if (recentStudent.aiKey) {
      console.log("\n🔍 Getting files for student...");
      try {
        const files = await axios.get(
          `${BASE_URL}/students/${recentStudent.aiKey}/files`,
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );

        console.log(`✅ Retrieved ${files.data.totalFiles} files`);

        if (files.data.files.length > 0) {
          const firstFile = files.data.files[0];
          console.log("\n📄 First file details:");
          console.log("   - Name:", firstFile.name);
          console.log("   - Key:", firstFile.key);
          console.log("   - Bucket:", firstFile.bucket);
          console.log("   - MimeType:", firstFile.mimeType);
          console.log("   - Size:", firstFile.size);
          console.log("   - Has URL:", !!firstFile.url);
        }
      } catch (error) {
        console.error(
          "❌ Error getting files:",
          error.response?.data || error.message
        );
      }
    }
  } catch (error) {
    console.error("\n❌ Debug failed:", error.response?.data || error.message);
  }
}

debugDatabase();
