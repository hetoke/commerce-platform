import { beforeAll, afterAll } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runSeed } from "../../scripts/runSeed.js";
let mongo;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();

  const uri = mongo.getUri();

  // connect mongoose for tests
  await mongoose.connect(uri, {
    dbName: "testDB",
  });

  // seed data
  await runSeed(uri, "testDB");
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});