// Load environment variables from current directory
require("dotenv").config();

const { uploadFileToS3, getPresignedUrl } = require("./modules/s3/s3.service");
const fs = require("fs");

async function testS3Service() {
  console.log("🧪 Testing S3 Service Directly\n");

  try {
    // Create a test file
    const testContent = "This is a test file for S3 upload";
    const testFilePath = "./test-s3-file.txt";
    fs.writeFileSync(testFilePath, testContent);

    console.log("1️⃣ Testing S3 upload...");
    const result = await uploadFileToS3(
      testFilePath,
      "test-s3-file.txt",
      "test-student"
    );
    console.log("✅ Upload result:", result);

    console.log("\n2️⃣ Testing pre-signed URL generation...");
    const url = await getPresignedUrl(result.key);
    console.log("✅ Pre-signed URL:", url);

    // Clean up test file
    fs.unlinkSync(testFilePath);

    console.log("\n✅ S3 Service Test Complete");
  } catch (error) {
    console.error("\n❌ S3 Service Test Failed:", error.message);
    console.error("Full error:", error);
  }
}

testS3Service();
