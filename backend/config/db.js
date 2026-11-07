const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/exam_portal';

  // 1. Attempt connection using primary configured URI (e.g. MongoDB Atlas)
  if (primaryUri && !primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
    try {
      const conn = await mongoose.connect(primaryUri);
      console.log(`[MongoDB Connected - Cloud Atlas]: ${conn.connection.host}/${conn.connection.name}`);
      return;
    } catch (primaryError) {
      console.warn(`[MongoDB Atlas Warning]: ${primaryError.message}`);
      console.log(`[MongoDB Resilient Fallback]: Connecting to local MongoDB at ${localUri}...`);
    }
  }

  // 2. Connect to local MongoDB instance
  try {
    const conn = await mongoose.connect(localUri);
    console.log(`[MongoDB Connected - Local]: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
