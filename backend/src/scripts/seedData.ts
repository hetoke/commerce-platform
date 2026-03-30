// @ts-nocheck
// seedData.js
import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import Item from "../models/Item.ts";
import Review from "../models/Review.ts";

// Store seeded IDs for testing/demo purposes
export const testIds = {
  users: {},
  items: [],
  reviews: [],
};

/**
 * Seed essential products and admin user for production
 */
export async function seedInitialData() {
  console.log("Seeding initial core data...");

  // Check if admin user already exists
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminExists = await User.findOne({ username: adminUsername });  
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 10);
    const adminUser = await User.create({
      username: process.env.ADMIN_USERNAME || "admin",
      email: process.env.ADMIN_EMAIL || "admin@hetoke.example.com",
      password: hashedPassword,
      provider: "local",
      role: "admin",
    });
    testIds.users.admin = adminUser._id.toString();
    console.log("Admin user created");
  } else {
    testIds.users.admin = adminExists._id.toString();
    console.log("Admin user already exists, skipped");
  }

  // Seed core items
  const coreItems = [
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
  ];

  for (const item of coreItems) {
    const exists = await Item.findOne({ name: item.name });
    if (!exists) {
      const newItem = await Item.create(item);
      testIds.items.push(newItem._id.toString());
      console.log(`Item created: ${item.name}`);
    } else {
      testIds.items.push(exists._id.toString());
      console.log(`Item exists: ${item.name}, skipped`);
    }
  }
}

/**
 * Seed mock/demo users and sample reviews
 */
export async function seedMockAccounts() {
  console.log("Seeding mock/demo users and reviews...");

  const mockUsers = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "alice", password: "customer123", role: "customer" },
    { username: "bob", password: "customer123", role: "customer" },
    { username: "clara", password: "customer123", role: "customer" },
  ];

  const createdUsers = {};

  for (const user of mockUsers) {
    const existing = await User.findOne({ username: user.username });
    if (!existing) {
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
      console.log(`User created: ${user.username}`);
    } else {
      createdUsers[user.username] = existing;
      testIds.users[user.username] = existing._id.toString();
      console.log(`User exists: ${user.username}, skipped`);
    }
  }

  // Seed items for mock reviews
  const items = await Item.find({});
  const createdItems = items.length ? items : [];

  // Sample reviews
  const sampleReviews = [
    {
      item: createdItems[0]?._id,
      user: createdUsers.alice._id,
      rating: 5,
      comment: "Absolutely love this backpack!",
    },
    {
      item: createdItems[0]?._id,
      user: createdUsers.bob._id,
      rating: 4,
      comment: "Very solid build quality.",
    },
    {
      item: createdItems[1]?._id,
      user: createdUsers.clara._id,
      rating: 3,
      comment: "Comfortable but runs small.",
    },
  ];

  for (const reviewData of sampleReviews) {
    // Check if review exists
    const exists = await Review.findOne({
      item: reviewData.item,
      user: reviewData.user,
    });
    if (!exists && reviewData.item && reviewData.user) {
      const review = await Review.create(reviewData);
      testIds.reviews.push(review._id.toString());

      // Update atomic counters
      await Item.updateOne(
        { _id: review.item },
        {
          $inc: { totalRating: review.rating, reviewCount: 1 },
        }
      );
      console.log(`Review added by ${reviewData.user} for item ${reviewData.item}`);
    }
  }
  console.log("Mock/demo seeding complete.");
}

