import dotenv from "dotenv";
import path from "path";
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

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
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

export default app;