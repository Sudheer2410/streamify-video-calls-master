import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5001;

const __dirname = path.resolve();

// Define allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === "production" 
  ? ["https://streamify-video-calls-master-axv9.onrender.com"] 
  : ["http://localhost:5173", "http://localhost:5174"];

const server = createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Track online users with their details
let onlineUsers = new Map(); // socketId -> userInfo

io.on("connection", (socket) => {
  // When user connects, they need to identify themselves
  socket.on("userConnected", (userInfo) => {
    onlineUsers.set(socket.id, {
      userId: userInfo.userId,
      fullName: userInfo.fullName,
      profilePic: userInfo.profilePic,
      connectedAt: new Date()
    });
    
    // Broadcast updated online users list to all clients
    io.emit("onlineUsers", {
      count: onlineUsers.size,
      users: Array.from(onlineUsers.values())
    });
    
    console.log(`${userInfo.fullName} connected. Total online: ${onlineUsers.size}`);
  });

  socket.on("disconnect", () => {
    const userInfo = onlineUsers.get(socket.id);
    if (userInfo) {
      onlineUsers.delete(socket.id);
      
      // Broadcast updated online users list to all clients
      io.emit("onlineUsers", {
        count: onlineUsers.size,
        users: Array.from(onlineUsers.values())
      });
      
      console.log(`${userInfo.fullName} disconnected. Total online: ${onlineUsers.size}`);
    }
  });
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // allow frontend to send cookies
  })
);

app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

// Development route to test if server is running
if (process.env.NODE_ENV === "development") {
  app.get("/", (req, res) => {
    res.json({ message: "Backend server is running!", environment: "development" });
  });
  
  // Test API route
  app.get("/api/test", (req, res) => {
    res.json({ message: "API is working!", timestamp: new Date().toISOString() });
  });
}

// Serve static files from the React app build (only in production)
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");
  const indexPath = path.join(distPath, "index.html");
  
  // Check if the dist folder and index.html exist before trying to serve them
  if (fs.existsSync(distPath) && fs.existsSync(indexPath)) {
    app.use(express.static(distPath));
    
    // Handle React routing, return all requests to React app
    app.get("*", (req, res) => {
      res.sendFile(indexPath);
    });
  } else {
    console.log("Frontend dist folder not found, running in API-only mode");
  }
}

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS origins: ${allowedOrigins.join(', ')}`);
  connectDB();
});
