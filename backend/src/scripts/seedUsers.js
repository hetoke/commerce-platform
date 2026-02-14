import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set. Set it in your shell and retry.");
  process.exit(1);
}

const users = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
  },
  {
    username: "alice",
    password: "customer123",
    role: "customer",
  },
  {
    username: "bob",
    password: "customer123",
    role: "customer",
  },
  {
    username: "clara",
    password: "customer123",
    role: "customer",
  },
];

const adminItems = [
  {
    name: "Midnight Leather Backpack",
    price: 129,
    location: "Seattle, WA",
    description: "Waterproof 22L backpack with steel buckles and padded back.",
    path: "products/backpack-001.jpg",
  },
  {
    name: "Aurora Street Sneakers",
    price: 98,
    location: "Portland, OR",
    description: "Lightweight mesh runner built for everyday city movement.",
    path: "products/sneakers-001.jpg",
  },
  {
    name: "Slate Minimal Watch",
    price: 210,
    location: "Brooklyn, NY",
    description: "Stainless steel 40mm case with matte charcoal dial.",
    path: "products/watch-001.jpg",
  },
  {
    name: "Noir Noise Cancelling",
    price: 249,
    location: "Austin, TX",
    description: "Over-ear headphones with 30-hour battery and deep bass.",
    path: "products/headphones-001.jpg",
  },
  {
    name: "Shadow Hoodie",
    price: 72,
    location: "Los Angeles, CA",
    description: "Heavyweight fleece hoodie with a relaxed drop-shoulder fit.",
    path: "products/hoodie-001.jpg",
  },
  {
    name: "Carbon Desk Lamp",
    price: 64,
    location: "Chicago, IL",
    description: "Adjustable arm lamp with warm LED glow for late nights.",
    path: "products/lamp-001.jpg",
  },
];

const seed = async () => {
  await mongoose.connect(uri, { dbName: "myDatabase" });

  const ops = await Promise.all(
    users.map(async (user) => {
      const password = await bcrypt.hash(user.password, 10);
      const items = user.role === "admin" ? adminItems : undefined;
      const update = {
        ...user,
        password,
        ...(items ? { items } : {}),
      };
      return {
        updateOne: {
          filter: { username: user.username },
          update: { $set: update },
          upsert: true,
        },
      };
    })
  );

  const result = await User.bulkWrite(ops);
  console.log("Seed complete:", result.result || result);

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seeding failed:", error.message);
  process.exit(1);
});
