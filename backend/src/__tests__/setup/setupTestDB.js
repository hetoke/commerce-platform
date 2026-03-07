// setupTestDB.js
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
console.log("SETUP DIR:", __dirname);
console.log("ENV PATH:", path.resolve(__dirname, "../../../.env"));
console.log("CWD:", process.cwd());

import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runSeed } from "../../scripts/runSeed.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") }); // points to backend/.env

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: "testDB" });
  await runSeed(uri, "testDB");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

console.log("TEST DB STARTED");