import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { seedDatabase } from "./seedData.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export async function runSeed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeding disabled in production");
  }

  console.log("Connected to:", mongoose.connection.name);

  await seedDatabase();

  console.log("Seed completed");
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const uri = process.env.MONGODB_URI;
  const dbName = "myDatabase";

  await mongoose.connect(uri, { dbName });

  try {
    await runSeed();
  } finally {
    await mongoose.disconnect();
  }
}