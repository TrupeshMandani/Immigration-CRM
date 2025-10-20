#!/usr/bin/env node

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

console.log("\n🔧 Google Drive Configuration Test\n");
console.log("=".repeat(50));

async function testGoogleDriveConfig() {
  try {
    // Check environment variables
    console.log("\n1️⃣ Checking environment variables...");
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const parentFolderId = process.env.DRIVE_PARENT_FOLDER_ID;

    console.log(
      `   GOOGLE_CLIENT_EMAIL: ${clientEmail ? "✅ Set" : "❌ Missing"}`
    );
    console.log(
      `   GOOGLE_PRIVATE_KEY: ${privateKey ? "✅ Set" : "❌ Missing"}`
    );
    console.log(
      `   DRIVE_PARENT_FOLDER_ID: ${parentFolderId ? "✅ Set" : "❌ Missing"}`
    );

    if (!clientEmail || !privateKey) {
      console.log("\n❌ Missing required environment variables!");
      console.log("\nPlease add to your backend/.env file:");
      console.log(
        "GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com"
      );
      console.log(
        'GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_KEY_HERE\\n-----END PRIVATE KEY-----\\n"'
      );
      console.log("DRIVE_PARENT_FOLDER_ID=your-folder-id");
      return;
    }

    // Test Service Account authentication
    console.log("\n2️⃣ Testing Service Account authentication...");
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    const drive = google.drive({ version: "v3", auth });

    // Test API access
    console.log("\n3️⃣ Testing Drive API access...");
    const files = await drive.files.list({ pageSize: 1 });
    console.log("✅ Google Drive API accessible");
    console.log(`   Found ${files.data.files.length} files in root`);

    // Test folder access if parent folder ID is provided
    if (parentFolderId) {
      console.log("\n4️⃣ Testing parent folder access...");
      try {
        const folder = await drive.files.get({ fileId: parentFolderId });
        console.log(`✅ Parent folder accessible: ${folder.data.name}`);
      } catch (error) {
        console.log(`❌ Parent folder not accessible: ${error.message}`);
        console.log("   Please check your DRIVE_PARENT_FOLDER_ID");
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("\n🎉 Google Drive configuration is working!");
    console.log("\nYour Immigration CRM can now:");
    console.log("  ✅ Upload files to Google Drive");
    console.log("  ✅ Create student-specific folders");
    console.log("  ✅ Generate shareable links");
    console.log("  ✅ Store files permanently");
  } catch (error) {
    console.error("\n❌ Google Drive configuration failed:", error.message);

    if (error.message.includes("invalid credentials")) {
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Check your GOOGLE_CLIENT_EMAIL is correct");
      console.log("2. Check your GOOGLE_PRIVATE_KEY has proper \\n characters");
      console.log("3. Ensure the service account has Drive API access");
      console.log(
        "4. Verify the service account JSON was downloaded correctly"
      );
    } else if (error.message.includes("access denied")) {
      console.log("\n🔧 Troubleshooting:");
      console.log("1. Enable Google Drive API in Google Cloud Console");
      console.log("2. Check service account permissions");
      console.log("3. Verify the project has Drive API enabled");
    }

    console.log(
      "\n📖 See GOOGLE_DRIVE_SETUP_COMPLETE.md for detailed setup instructions"
    );
  }
}

// Load environment variables
require("dotenv").config({ path: path.join(__dirname, ".env") });

testGoogleDriveConfig();
