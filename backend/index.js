// backend/index.js
import express from "express";
import rootRouter from "./routes/index.js";
import cors from "cors";
const app = express();

import path from "path";
const __dirname = path.resolve();

// Configure CORS for production
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// API routes MUST come before static files and catch-all
app.use("/api/v1", rootRouter);

// Static files for frontend
app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Catch-all handler for SPA routing - only for non-API routes
app.use((req, res, next) => {
  // If it's an API route, skip this handler
  if (req.path.startsWith("/api/")) {
    return next();
  }
  // For all other routes, serve the React app
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
