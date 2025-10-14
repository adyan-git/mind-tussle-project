// src/index.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import { verifyToken } from "./middleware/auth.js"; // ✅ Add this line

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// ✅ Protected route to test JWT
app.get("/api/protected", verifyToken, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user,
  });
});

// Simple test route
app.get("/", (req, res) => {
  res.send("Mind Tussle backend is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
