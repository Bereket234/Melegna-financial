import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
let cachedConnection = null;

export async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined");
  }
  
  try {
    const connection = await mongoose.connect(uri);
    cachedConnection = connection;
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
