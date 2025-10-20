#!/usr/bin/env node

require("dotenv").config();

console.log("\n🔍 Checking Environment Variables\n");
console.log("=".repeat(50));

console.log("\n1️⃣ GOOGLE_CLIENT_EMAIL:");
console.log("   Value:", process.env.GOOGLE_CLIENT_EMAIL);
console.log("   Length:", process.env.GOOGLE_CLIENT_EMAIL?.length || 0);

console.log("\n2️⃣ GOOGLE_PRIVATE_KEY:");
console.log("   Length:", process.env.GOOGLE_PRIVATE_KEY?.length || 0);
console.log(
  "   Starts with:",
  process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) + "..."
);
console.log(
  "   Ends with:",
  "..." +
    process.env.GOOGLE_PRIVATE_KEY?.substring(
      process.env.GOOGLE_PRIVATE_KEY?.length - 30
    )
);

console.log("\n3️⃣ DRIVE_PARENT_FOLDER_ID:");
console.log("   Value:", process.env.DRIVE_PARENT_FOLDER_ID);
console.log("   Length:", process.env.DRIVE_PARENT_FOLDER_ID?.length || 0);

console.log("\n4️⃣ Private Key Analysis:");
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
if (privateKey) {
  console.log('   Contains "-----BEGIN":', privateKey.includes("-----BEGIN"));
  console.log('   Contains "-----END":', privateKey.includes("-----END"));
  console.log('   Contains "\\n":', privateKey.includes("\\n"));
  console.log("   Contains actual newlines:", privateKey.includes("\n"));
  console.log(
    "   Has proper format:",
    privateKey.startsWith("-----BEGIN") &&
      privateKey.endsWith("-----END PRIVATE KEY-----\n")
  );
} else {
  console.log("   ❌ Private key not found");
}

console.log("\n" + "=".repeat(50));
console.log("\n💡 Common Issues:");
console.log('1. Private key should start with "-----BEGIN PRIVATE KEY-----"');
console.log('2. Private key should end with "-----END PRIVATE KEY-----"');
console.log("3. Private key should have actual newlines, not \\n characters");
console.log("4. Private key should be wrapped in quotes in .env file");
console.log("5. Make sure there are no extra spaces or characters");
