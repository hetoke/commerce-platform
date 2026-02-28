import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Review from "../models/Review.js";

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
    detailedDescription:
      "Crafted from full-grain leather with reinforced stitching and waterproof lining. Features a padded laptop compartment, anti-theft zipper pocket, breathable back support, and adjustable shoulder straps designed for long daily commutes.",
    imagePath: "products/backpack-001.jpg",
  },
  {
    name: "Aurora Street Sneakers",
    price: 98,
    location: "Portland, OR",
    description: "Lightweight mesh runner built for everyday city movement.",
    detailedDescription:
      "Engineered with breathable dual-layer mesh and memory foam insoles for all-day comfort. Shock-absorbing sole with anti-slip rubber grip designed for urban environments and light training.",
    imagePath: "products/sneakers-001.jpg",
  },
  {
    name: "Slate Minimal Watch",
    price: 210,
    location: "Brooklyn, NY",
    description: "Stainless steel 40mm case with matte charcoal dial.",
    detailedDescription:
      "Minimalist timepiece with sapphire crystal glass, precision quartz movement, and interchangeable straps. Water-resistant up to 50 meters, designed for both formal and casual wear.",
    imagePath: "products/watch-001.jpg",
  },
  {
    name: "Noir Noise Cancelling",
    price: 249,
    location: "Austin, TX",
    description: "Over-ear headphones with 30-hour battery and deep bass.",
    detailedDescription:
      "Active noise cancellation with adaptive ambient mode. 40mm dynamic drivers deliver deep bass and crisp highs. Supports Bluetooth 5.3, USB-C fast charging, and multi-device pairing.",
    imagePath: "products/headphones-001.jpg",
  }
];

const seed = async () => {
  await mongoose.connect(uri, { dbName: "myDatabase" });
  console.log("Connected to:", mongoose.connection.name);

  // 🔥 Clean DB
  await User.deleteMany({});
  await Item.deleteMany({});
  await Review.deleteMany({});
  console.log("Old data cleared.");

  // Create users
  const createdUsers = {};
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

    createdUsers[user.username] = newUser;

    if (user.role === "admin") {
      adminUser = newUser;
    }
  }

  console.log("Users created.");

  // Insert items
  const createdItems = await Item.insertMany(adminItems);
  console.log("Items created.");

  // 🔥 Seed some reviews
  const sampleReviews = [
    {
      item: createdItems[0]._id,
      user: createdUsers.alice._id,
      rating: 5,
      comment: "Absolutely love this backpack!"
    },
    {
      item: createdItems[0]._id,
      user: createdUsers.bob._id,
      rating: 4,
      comment: "Very solid build quality."
    },
    {
      item: createdItems[1]._id,
      user: createdUsers.clara._id,
      rating: 3,
      comment: "Comfortable but runs small."
    }
  ];

  for (const reviewData of sampleReviews) {
    const review = await Review.create(reviewData);

    const ratingFieldMap = {
      1: "ratingStats.one",
      2: "ratingStats.two",
      3: "ratingStats.three",
      4: "ratingStats.four",
      5: "ratingStats.five",
    };

    await Item.updateOne(
      { _id: review.item },
      {
        $inc: {
          totalRating: review.rating,
          reviewCount: 1,
          [ratingFieldMap[review.rating]]: 1,
        },
      }
    );
  }

  console.log("Reviews seeded with atomic counters.");

  console.log("Seeding complete.");
  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});