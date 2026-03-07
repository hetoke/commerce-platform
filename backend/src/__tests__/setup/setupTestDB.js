import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runSeed } from "../../scripts/runSeed.js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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