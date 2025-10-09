
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/student_records',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  GOOGLE_CLIENT_EMAIL: process.env.GOOGLE_CLIENT_EMAIL,
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY,
  DRIVE_PARENT_FOLDER_ID: process.env.DRIVE_PARENT_FOLDER_ID,
};
