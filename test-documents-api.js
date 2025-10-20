#!/usr/bin/env node

const axios = require("axios");

const BASE_URL = "http://localhost:4000";

async function testDocumentsAPI() {
  console.log("\n🧪 Testing Documents API\n");
  console.log("=".repeat(50));

  try {
    // 1. Health Check
    console.log("\n1️⃣ Testing backend health...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log("✅ Backend is healthy:", health.data);

    // 2. Student Login
    console.log("\n2️⃣ Logging in as student...");
    const studentLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: "viewer1761000776467",
      password: "testpass123",
    });
    const studentToken = studentLogin.data.token;
    const studentUser = studentLogin.data.user;
    console.log("✅ Student logged in successfully");
    console.log("   User data:", JSON.stringify(studentUser, null, 2));

    // 3. Test Documents API
    console.log("\n3️⃣ Testing documents API...");
    const aiKey = studentUser.aiKey;
    console.log("   Using aiKey:", aiKey);

    const documents = await axios.get(
      `${BASE_URL}/api/students/${aiKey}/files`,
      {
        headers: { Authorization: `Bearer ${studentToken}` },
      }
    );
    console.log("✅ Documents API working");
    console.log("   Response:", JSON.stringify(documents.data, null, 2));

    console.log("\n" + "=".repeat(50));
    console.log("\n🎉 Documents API test completed!\n");
    console.log("Summary:");
    console.log("  ✅ Backend is healthy");
    console.log("  ✅ Student login successful");
    console.log("  ✅ User has aiKey:", !!aiKey);
    console.log("  ✅ Documents API returns data");
    console.log("  ✅ Total files:", documents.data.totalFiles);
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

testDocumentsAPI();
