import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Item from "../models/Item.ts";
import Order from "../models/Order.ts";
import Purchase from "../models/Purchase.ts";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const EXCHANGE_RATE = Number(process.env.USD_TO_VND_RATE || 25000);
const dbName = process.env.DB_NAME || "myDatabase";

const toVnd = (value: number) => Math.round(value * EXCHANGE_RATE);

const main = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  if (!Number.isFinite(EXCHANGE_RATE) || EXCHANGE_RATE <= 0) {
    throw new Error("USD_TO_VND_RATE must be a positive number");
  }

  await mongoose.connect(uri, { dbName });

  try {
    const items = await Item.find();
    for (const item of items) {
      item.price = toVnd(item.price);
      await item.save();
    }

    const purchases = await Purchase.find();
    for (const purchase of purchases) {
      purchase.priceAtPurchase = toVnd(purchase.priceAtPurchase);
      await purchase.save();
    }

    const orders = await Order.find();
    for (const order of orders) {
      order.items = order.items.map((item) => ({
        ...item.toObject(),
        priceAtPurchase: toVnd(item.priceAtPurchase),
      }));
      order.totalPrice = toVnd(order.totalPrice);
      await order.save();
    }

    console.log(
      `Converted prices to VND using exchange rate ${EXCHANGE_RATE} for ${items.length} items, ${purchases.length} purchases, and ${orders.length} orders.`
    );
  } finally {
    await mongoose.disconnect();
  }
};

main().catch((error) => {
  console.error("Price conversion failed:", error);
  process.exit(1);
});
