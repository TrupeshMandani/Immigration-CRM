const axios = require("axios");

const API_BASE = "http://localhost:4000/api";

async function testAPI() {
  console.log("🧪 Testing Immigration CRM API...\n");

  try {
    // Test 1: Health Check
    console.log("1. Testing API Health...");
    const health = await axios.get(`${API_BASE}/`);
    console.log("✅ API Health:", health.data.message);

    // Test 2: Contact Form
    console.log("\n2. Testing Contact Form...");
    const contact = await axios.post(`${API_BASE}/contact`, {
      name: "John Doe",
      email: "john@example.com",
      phone: "123-456-7890",
      message: "I want to apply for immigration",
    });
    console.log("✅ Contact submitted:", contact.data.message);

    // Test 3: Try to create admin (might fail if exists)
    console.log("\n3. Testing Admin Creation...");
    try {
      const admin = await axios.post(`${API_BASE}/auth/register-admin`, {
        username: "admin",
        email: "admin@test.com",
        password: "admin123",
      });
      console.log("✅ Admin created:", admin.data.message);
    } catch (error) {
      console.log(
        "ℹ️  Admin might already exist:",
        error.response?.data?.message
      );
    }

    // Test 4: Try admin login
    console.log("\n4. Testing Admin Login...");
    try {
      const login = await axios.post(`${API_BASE}/auth/login`, {
        username: "admin",
        password: "admin123",
      });
      console.log("✅ Admin login successful!");
      console.log("Token received:", login.data.token ? "Yes" : "No");
      console.log("User role:", login.data.user.role);

      const token = login.data.token;

      // Test 5: Get pending contacts with token
      console.log("\n5. Testing Protected Route...");
      const pending = await axios.get(`${API_BASE}/students/pending/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Protected route accessed successfully!");
      console.log("Pending contacts:", pending.data.length);
    } catch (error) {
      console.log("❌ Login failed:", error.response?.data?.message);
      console.log("This means you need to create an admin account first.");
    }

    console.log("\n🎯 Next Steps:");
    console.log(
      "1. If admin login failed, you need to create an admin account"
    );
    console.log("2. Test the frontend login with admin credentials");
    console.log("3. Test student creation and activation flow");
  } catch (error) {
    console.log("❌ API Test failed:", error.message);
    console.log("Make sure backend is running on port 4000");
  }
}

testAPI();
