const {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs");
const path = require("path");
const env = require("../../config/env");

// Initialize S3 client
const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

// Upload file to S3
async function uploadFileToS3(filePath, fileName, studentUsername) {
  try {
    console.log(`🔍 S3 Upload Debug:`);
    console.log(`   filePath: ${filePath}`);
    console.log(`   fileName: ${fileName}`);
    console.log(`   studentUsername: ${studentUsername}`);
    console.log(`   bucket: ${env.AWS_S3_BUCKET_NAME}`);

    const fileContent = fs.readFileSync(filePath);
    const key = `${studentUsername}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: getMimeType(fileName),
    });

    await s3Client.send(command);

    console.log(`✅ Uploaded ${fileName} to S3: ${key}`);

    return {
      key,
      bucket: env.AWS_S3_BUCKET_NAME,
      fileName,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ S3 Upload Error:`, error);
    throw error;
  }
}

// Generate pre-signed URL for secure access
async function getPresignedUrl(key) {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, {
    expiresIn: env.S3_PRESIGNED_URL_EXPIRY,
  });

  return url;
}

// List all files for a student
async function listStudentFiles(studentUsername) {
  const command = new ListObjectsV2Command({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Prefix: `${studentUsername}/`,
  });

  const response = await s3Client.send(command);
  return response.Contents || [];
}

// Get mime type from file extension
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Delete local file after upload
function deleteLocalFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log("🗑️ Deleted local file:", filePath);
  } catch (err) {
    console.warn("⚠️ Failed to delete local file:", err.message);
  }
}

module.exports = {
  uploadFileToS3,
  getPresignedUrl,
  listStudentFiles,
  deleteLocalFile,
  s3Client,
};
