import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Item from "../models/Item.js";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "alice", password: "customer123", role: "customer" },
  { username: "bob", password: "customer123", role: "customer" },
  { username: "clara", password: "customer123", role: "customer" },
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

  console.log("Connected to:", mongoose.connection.name);

  // 🔥 Clean database first (optional but recommended for mock data)
  await User.deleteMany({});
  await Item.deleteMany({});

  console.log("Old data cleared.");

  // Create users
  let adminUser = null;

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    const newUser = await User.create({
      username: user.username.toLowerCase(),
      email: `${user.username.toLowerCase()}@example.com`,
      password: hashedPassword,
      provider: "local",
      role: user.role,
    });

    if (user.role === "admin") {
      adminUser = newUser;
    }
  }

  console.log("Users created.");

  // Create items for admin
  if (adminUser) {
    const itemsToInsert = adminItems.map((item) => ({
      ...item,
      createdBy: adminUser._id,
    }));

    await Item.insertMany(itemsToInsert);
    console.log("Admin items created.");
  }

  console.log("Seeding complete.");
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});