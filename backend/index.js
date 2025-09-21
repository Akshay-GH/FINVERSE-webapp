// backend/index.js
import express from "express";
import rootRouter from "./routes/index.js";
import cors from "cors";
const app = express();

import path from "path";
const __dirname = path.resolve();

app.use(cors(), express.json());
app.use("/api/v1", rootRouter);

app.use(express.static(path.join(__dirname, "/frontend/dist")));

// Catch-all handler for SPA routing
app.use((req, res) => {
  res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
});

app.listen(3000);
console.log("Server started on port 3000");
