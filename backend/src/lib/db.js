import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("=== MongoDB Connection Debug ===");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    console.log("MONGO_URI exists:", !!process.env.MONGO_URI);
    
    if (process.env.MONGO_URI) {
      // Hide password in logs for security
      const uriParts = process.env.MONGO_URI.split('@');
      if (uriParts.length > 1) {
        console.log("MONGO_URI (masked):", "***@" + uriParts[1]);
      } else {
        console.log("MONGO_URI:", process.env.MONGO_URI);
      }
    } else {
      console.log("MONGO_URI not found in environment variables");
      console.log("Using fallback: mongodb://localhost:27017/streamify-video-calls");
      process.env.MONGO_URI = "mongodb://localhost:27017/streamify-video-calls";
    }
    
    console.log("Attempting to connect...");
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
    });
    
    console.log("✅ MongoDB Connected Successfully!");
    console.log("Host:", conn.connection.host);
    console.log("Database:", conn.connection.name);
    console.log("================================");
    
  } catch (error) {
    console.log("❌ MongoDB Connection Failed!");
    console.log("Error type:", error.name);
    console.log("Error message:", error.message);
    console.log("Error code:", error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("💡 Solution: MongoDB server is not running. Start MongoDB or use MongoDB Atlas.");
    } else if (error.code === 'ENOTFOUND') {
      console.log("💡 Solution: Check your connection string. Make sure the host is correct.");
    } else if (error.message.includes('Authentication failed')) {
      console.log("💡 Solution: Check your username and password in the connection string.");
    }
    
    console.log("Server will continue without database connection");
    console.log("================================");
  }
};
