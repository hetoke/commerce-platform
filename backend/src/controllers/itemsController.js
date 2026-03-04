import fs from "fs";
import path from "path";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Purchase from "../models/Purchase.js";
import mongoose from "mongoose";

export const listItems = async (req, res, next) => {
  try {
    const items = await Item.find({})
      .select(
        "name price location description totalRating averageRating reviewCount sellCount imagePath createdAt"
      )
      .sort({ createdAt: -1 });

    //console.log(items)

    return res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getItemDetails = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(item);
  } catch (err) {
    next(err);
  }
};

export const listCustomerItems = async (req, res) => {
  const purchases = await Purchase.find({ user: req.user.id })
    .populate("item")
    .lean();

  const items = purchases
    .filter(p => p.item) // in case item was deleted
    .map(p => ({
      id: p._id,           // ✅ unique purchase id
      itemId: p.item._id,
      name: p.item.name,
      price: p.item.price,
      location: p.item.location,
      description: p.item.description,
      path: p.item.imagePath,
      purchasedAt: p.createdAt,
    }));

  return res.json(items);
};

export const createItem = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { name, price, location, description, detailedDescription, path } = req.body;

  if (!name || price === undefined || !location || !description) {
    return res.status(400).json({ message: "Missing item fields." });
  }

  const item = await Item.create({
    name,
    price,
    location,
    description,
    detailedDescription,
    path,
  });

  return res.status(201).json(item);
};

export const updateItem = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { itemId } = req.params;

  const item = await Item.findByIdAndUpdate(
    itemId,
    req.body,
    { new: true }
  );

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  return res.json(item);
};

export const deleteItem = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { itemId } = req.params;

  const item = await Item.findByIdAndDelete(itemId);

  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  return res.json({ message: "Item deleted." });
};

export const buyItem = async (req, res) => {
  const { itemId } = req.params;

  const item = await Item.findById(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  try {
    const purchase = await Purchase.create({
      user: req.user.id,
      item: item._id,
      priceAtPurchase: item.price,
    });

    return res.status(201).json(purchase);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Item already purchased.",
      });
    }

    return res.status(500).json({ message: "Purchase failed." });
  }
};

export const cancelPurchase = async (req, res) => {
  const { itemId } = req.params; // purchase id

  const deleted = await Purchase.findOneAndDelete({
    _id: itemId,
    user: req.user.id,
  });

  if (!deleted) {
    return res.status(404).json({ message: "Purchase not found." });
  }

  return res.json({ message: "Purchase canceled successfully." });
};