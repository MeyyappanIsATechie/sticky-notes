// If you ever deploy this to a cloud server (Railway, Render, EC2),
//  you can remove those two lines — cloud environments have reliable DNS that doesn't need this override.
//  It's purely a local dev workaround for your ISP's DNS behavior.
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Forces Google Public DNS

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

app.get("/api/health", async (req, res) => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  try {
    await redis.set("health-check", "ok", { ex: 30 });
    const redisStatus = await redis.get("health-check");
    res.json({
      mongo: states[mongoose.connection.readyState] || "unknown",
      redis: redisStatus === "ok" ? "connected" : "not connected",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.error("Server not started because MongoDB is unreachable.");
    process.exitCode = 1;
  });
