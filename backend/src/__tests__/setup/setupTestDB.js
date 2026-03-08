import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runSeed } from "../../scripts/runSeed.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri, { dbName: "testDB" });
  await runSeed({ mode: "mock" }); // seeds admin + mock users (alice, bob, clara) + reviews
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

console.log("TEST DB STARTED");