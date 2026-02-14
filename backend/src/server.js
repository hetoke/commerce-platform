import dotenv from "dotenv";
import path from "path";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import itemsRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";


dotenv.config({ path: path.resolve(process.cwd(), ".env") });
const app = express();

// connect database
connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/account", accountRoutes);

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
