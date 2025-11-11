import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
let cachedConnection = null;

export async function connectToDatabase() {
  const uri =
    process.env.MONGODB_URI
  try {
    const connection = await mongoose.connect(uri);
    cachedConnection = connection;
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
