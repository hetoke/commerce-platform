import express from "express";
import mongoose from "mongoose";

const router = express.Router();

router.get("/health", async (req, res) => {
  try {
    // Optional: check MongoDB connection
    const dbState = mongoose.connection.readyState; // 1 = connected
    const dbStatus = dbState === 1 ? "up" : "down";

    res.status(200).json({
      status: "ok",
      db: dbStatus,
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

export default router;