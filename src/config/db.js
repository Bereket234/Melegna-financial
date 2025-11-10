import mongoose from "mongoose";

let cachedConnection = null;

export async function connectToDatabase() {
  // Return cached connection if available (for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri =
    process.env.MONGODB_URI || "mongodb://localhost:27017/melegna_financial";

  mongoose.set("strictQuery", true);

  const options = {
    autoIndex: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  };

  try {
    const connection = await mongoose.connect(uri, options);
    cachedConnection = connection;
    console.log("Connected to MongoDB");
    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
