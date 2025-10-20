const axios = require("axios");

const API_BASE = "http://localhost:4000/api";

async function testSystem() {
  console.log("🧪 Testing Immigration CRM System...\n");

  try {
    // Test 1: API Health Check
    console.log("1. Testing API Health Check...");
    const healthResponse = await axios.get(`${API_BASE}/`);
    console.log("✅ API is running:", healthResponse.data.message);

    // Test 2: Contact Form Submission
    console.log("\n2. Testing Contact Form...");
    const contactData = {
      name: "Test Student",
      email: "test@example.com",
      phone: "123-456-7890",
      message: "I want to apply for immigration services",
    };

    const contactResponse = await axios.post(
      `${API_BASE}/contact`,
      contactData
    );
    console.log("✅ Contact submitted:", contactResponse.data.message);
    const contactId = contactResponse.data.contactId;

    // Test 3: Admin Registration
    console.log("\n3. Testing Admin Registration...");
    try {
      const adminData = {
        username: "admin",
        email: "admin@immigrationcrm.com",
        password: "admin123",
      };

      const adminResponse = await axios.post(
        `${API_BASE}/auth/register-admin`,
        adminData
      );
      console.log("✅ Admin created:", adminResponse.data.message);
      const adminToken = adminResponse.data.token;

      // Test 4: Admin Login
      console.log("\n4. Testing Admin Login...");
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        username: "admin",
        password: "admin123",
      });
      console.log("✅ Admin login successful:", loginResponse.data.message);
      const loginToken = loginResponse.data.token;

      // Test 5: Get Pending Contacts (Admin)
      console.log("\n5. Testing Get Pending Contacts...");
      const pendingResponse = await axios.get(
        `${API_BASE}/students/pending/contacts`,
        {
          headers: { Authorization: `Bearer ${loginToken}` },
        }
      );
      console.log(
        "✅ Pending contacts retrieved:",
        pendingResponse.data.length,
        "contacts"
      );

      // Test 6: Activate Student
      console.log("\n6. Testing Student Activation...");
      const activateResponse = await axios.post(
        `${API_BASE}/students/${contactId}/activate`,
        {
          username: "teststudent",
          password: "student123",
        },
        {
          headers: { Authorization: `Bearer ${loginToken}` },
        }
      );
      console.log("✅ Student activated:", activateResponse.data.message);

      // Test 7: Student Login
      console.log("\n7. Testing Student Login...");
      const studentLoginResponse = await axios.post(`${API_BASE}/auth/login`, {
        username: "teststudent",
        password: "student123",
      });
      console.log(
        "✅ Student login successful:",
        studentLoginResponse.data.message
      );
      const studentToken = studentLoginResponse.data.token;
      const studentAiKey = studentLoginResponse.data.user.aiKey;

      // Test 8: Get Student Profile
      console.log("\n8. Testing Get Student Profile...");
      const studentProfileResponse = await axios.get(
        `${API_BASE}/students/${studentAiKey}`
      );
      console.log(
        "✅ Student profile retrieved:",
        studentProfileResponse.data.contactInfo.name
      );

      // Test 9: Get All Students (Admin)
      console.log("\n9. Testing Get All Students...");
      const allStudentsResponse = await axios.get(`${API_BASE}/students`, {
        headers: { Authorization: `Bearer ${loginToken}` },
      });
      console.log(
        "✅ All students retrieved:",
        allStudentsResponse.data.length,
        "students"
      );

      console.log("\n🎉 All backend tests passed!");
      console.log("\n📋 Test Summary:");
      console.log("- API Health: ✅");
      console.log("- Contact Form: ✅");
      console.log("- Admin Registration: ✅");
      console.log("- Admin Login: ✅");
      console.log("- Student Activation: ✅");
      console.log("- Student Login: ✅");
      console.log("- Student Profile: ✅");
      console.log("- Admin Dashboard: ✅");
    } catch (error) {
      console.log(
        "❌ Admin registration failed:",
        error.response?.data?.message || error.message
      );
      console.log(
        "This might be because an admin already exists. Trying login instead..."
      );

      // Try admin login
      try {
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
          username: "admin",
          password: "admin123",
        });
        console.log("✅ Admin login successful:", loginResponse.data.message);
      } catch (loginError) {
        console.log(
          "❌ Admin login failed:",
          loginError.response?.data?.message || loginError.message
        );
        console.log("Please check the backend logs for errors.");
      }
    }
  } catch (error) {
    console.log(
      "❌ Test failed:",
      error.response?.data?.message || error.message
    );
    console.log("Make sure the backend server is running on port 4000");
  }
}

testSystem();

