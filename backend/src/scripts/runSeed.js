import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { seedDatabase } from "./seedData.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export async function runSeed(uri, dbName) {

  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeding disabled in production");
  }

  if (!uri) {
    throw new Error("Missing MongoDB URI");
  }

  await mongoose.connect(uri, { dbName });

  console.log("Connected to:", mongoose.connection.name);

  await seedDatabase();

  await mongoose.disconnect();

  console.log("Seed completed");
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const uri = process.env.MONGODB_URI;
  const dbName = "myDatabase";

  runSeed(uri, dbName).catch(err => {
    console.error(err);
    process.exit(1);
  });
}