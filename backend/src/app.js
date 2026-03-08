import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import authRoutes from "./routes/authRoutes.js";
import itemsRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

import healthRouter from "./routes/health.js";

import path from "path";
import { fileURLToPath } from "url";

const app = express();



// Replace __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now you can use __dirname
const buildPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(buildPath));

app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "https://commerce-platform-fe.onrender.com"
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS not allowed"), false);
    }
  },
  credentials: true,
}));

app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/items", reviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/health", healthRouter);

export default app;