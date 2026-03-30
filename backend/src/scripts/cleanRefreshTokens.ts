import mongoose from "mongoose";
import RefreshToken from "../models/RefreshToken.ts";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const cleanRefreshTokens = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "myDatabase" });

    //console.log("Connected to:", mongoose.connection.name);
    //console.log("Full URI:", process.env.MONGODB_URI);

    const result = await RefreshToken.deleteMany({});
    console.log(`Deleted ${result.deletedCount} refresh tokens.`);

    process.exit(0);
  } catch (err) {
    console.error("Error cleaning refresh tokens:", err);
    process.exit(1);
  }
};

cleanRefreshTokens();