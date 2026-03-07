import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Review from "../models/Review.js";

// Object to store seeded IDs for tests
export const testIds = {
  users: {},
  items: [],
};

export async function seedDatabase() {
  // Clear previous data
  await User.deleteMany({});
  await Item.deleteMany({});
  await Review.deleteMany({});

  // Users
  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "alice", password: "customer123", role: "customer" },
    { username: "bob", password: "customer123", role: "customer" },
    { username: "clara", password: "customer123", role: "customer" },
  ];

  const createdUsers = {};

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await User.create({
      username: user.username.toLowerCase(),
      email: `${user.username}@example.com`,
      password: hashedPassword,
      provider: "local",
      role: user.role,
    });
    createdUsers[user.username] = newUser;
    testIds.users[user.username] = newUser._id.toString();
  }

  console.log("Users seeded");

  // Items (add stock for validation testing)
  const adminItems = [
    {
      name: "Midnight Leather Backpack",
      price: 129,
      location: "Seattle, WA",
      description: "Waterproof 22L backpack with steel buckles and padded back.",
      detailedDescription:
        "Crafted from full-grain leather with reinforced stitching and waterproof lining. Features a padded laptop compartment, anti-theft zipper pocket, breathable back support, and adjustable shoulder straps designed for long daily commutes.",
      imagePath: "products/backpack-001.jpg",
      stock: 10,
    },
    {
      name: "Aurora Street Sneakers",
      price: 98,
      location: "Portland, OR",
      description: "Lightweight mesh runner built for everyday city movement.",
      detailedDescription:
        "Engineered with breathable dual-layer mesh and memory foam insoles for all-day comfort. Shock-absorbing sole with anti-slip rubber grip designed for urban environments and light training.",
      imagePath: "products/sneakers-001.jpg",
      stock: 15,
    },
    {
      name: "Slate Minimal Watch",
      price: 210,
      location: "Brooklyn, NY",
      description: "Stainless steel 40mm case with matte charcoal dial.",
      detailedDescription:
        "Minimalist timepiece with sapphire crystal glass, precision quartz movement, and interchangeable straps. Water-resistant up to 50 meters, designed for both formal and casual wear.",
      imagePath: "products/watch-001.jpg",
      stock: 5,
    },
    {
      name: "Noir Noise Cancelling Headphones",
      price: 249,
      location: "Austin, TX",
      description: "Over-ear headphones with 30-hour battery and deep bass.",
      detailedDescription:
        "Active noise cancellation with adaptive ambient mode. 40mm dynamic drivers deliver deep bass and crisp highs. Supports Bluetooth 5.3, USB-C fast charging, and multi-device pairing.",
      imagePath: "products/headphones-001.jpg",
      stock: 8,
    },
  ];

  const createdItems = await Item.insertMany(adminItems);
  testIds.items = createdItems.map((i) => i._id.toString());
  console.log("Items seeded:", testIds.items);

  // Reviews
  const sampleReviews = [
    {
      item: createdItems[0]._id,
      user: createdUsers.alice._id,
      rating: 5,
      comment: "Absolutely love this backpack!",
    },
    {
      item: createdItems[0]._id,
      user: createdUsers.bob._id,
      rating: 4,
      comment: "Very solid build quality.",
    },
    {
      item: createdItems[1]._id,
      user: createdUsers.clara._id,
      rating: 3,
      comment: "Comfortable but runs small.",
    },
  ];

  for (const reviewData of sampleReviews) {
    const review = await Review.create(reviewData);

    await Item.updateOne(
      { _id: review.item },
      {
        $inc: {
          totalRating: review.rating,
          reviewCount: 1,
        },
      }
    );
  }

  console.log("Reviews seeded with atomic counters.");
  console.log("Database seeding complete.");

  // Optional: disconnect mongoose if this script runs standalone
  // await mongoose.disconnect();
}