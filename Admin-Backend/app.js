import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import blogsRoutes from "./routes/blogs.js";
import authRoutes from "./routes/auth.js";
import membersRoutes from "./routes/members.js";
import ErrorResponse from "./utils/errorResponse.js";

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

app.use(cors());

app.use(express.json());

// Cached MongoDB connection for serverless environments
let cachedConnection = null;

export const connectDB = async () => {
  // Reuse existing connection if it's still connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.ATLAS_URI;

  if (!uri) {
    throw new Error("MongoDB URI is not defined in environment variables");
  }

  try {
    cachedConnection = await mongoose.connect(uri);
    console.log("MongoDB connection established successfully");
    return cachedConnection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

// Attach routes
app.use("/api/blogs", blogsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "GYWS Admin Backend API is running"
  });
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new ErrorResponse(`Route not found: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for server-side visibility
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export default app;