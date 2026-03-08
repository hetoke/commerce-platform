// runSeed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { seedInitialData, seedMockAccounts } from "./seedData.js";
import dns from "dns";

// Force Node to use Google's DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);
console.log("Custom DNS servers set:", dns.getServers());

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export async function runSeed({ mode = "initial" } = {}) {
  const env = process.env.NODE_ENV || "development";
  const seedMode = mode || process.env.SEED_MODE || "initial";
  const seedDone = process.env.SEED_DONE === "true";

  console.log(`NODE_ENV=${env}, SEED_MODE=${seedMode}, SEED_DONE=${seedDone}`);

  if (env === "production" && seedMode !== "mock" && !seedDone) {
    throw new Error(
      "Production initial seed already done. Set SEED_DONE=true to rerun."
    );
  }

  if (seedMode === "mock") {
    await seedMockAccounts();
    console.log("Mock/demo accounts seeded");
  } else {
    await seedInitialData();
    console.log("Initial production data seeded");
  }

  console.log("Seeding completed successfully");
}

/**
 * CLI entry point — only runs if script executed directly via Node
 */
if (process.argv[1].endsWith("runSeed.js")) {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || "myDatabase";

  if (!uri) {
    console.error("Error: MONGODB_URI is not set in environment variables");
    process.exit(1);
  }

  const main = async () => {
    try {
      await mongoose.connect(uri, {
        dbName
      });

      console.log(`Connected to MongoDB cluster: ${uri}, DB: ${dbName}`);

      await runSeed(); // use env SEED_MODE by default
    } catch (err) {
      console.error("Seeding failed:", err);
      process.exit(1);
    } finally {
      await mongoose.disconnect();
      console.log("Disconnected from database");
    }
  };

  await main();
}