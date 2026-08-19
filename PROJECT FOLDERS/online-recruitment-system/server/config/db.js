import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from root or server directory
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Error: MONGO_URI is not defined in your server/.env file.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'recruitment_db',
    });
    console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
    console.log(`📁 Active Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Atlas Connection Failed:`, error.message);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
};
