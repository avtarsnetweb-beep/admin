require("dotenv").config();
const prisma = require("./config/prisma");
const bcrypt = require("bcryptjs");
const express = require("express");
const cors = require("cors");

const app = express();

// Import routes
const authRoutes = require("./routes/auth.js");
const documentRoutes = require("./routes/documents");
const adminRoutes = require("./routes/admin");

// CORS options
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://auth-project-avtar.netlify.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

// Apply CORS
app.use(cors(corsOptions));

// Fix Express 5 OPTIONS issue
app.options("/*", cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Auth API Server",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});
