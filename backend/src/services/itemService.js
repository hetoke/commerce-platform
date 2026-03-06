import Item from "../models/Item.js";
import mongoose from "mongoose";

export const listItems = async () => {
  return await Item.find({})
    .select(
      "name price imagePath location description totalRating averageRating reviewCount sellCount imagePath createdAt"
    )
    .sort({ createdAt: -1 });
};

export const getItemDetails = async (itemId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    throw { status: 400, message: "Invalid item ID" };
  }

  const item = await Item.findById(itemId);

  if (!item) {
    throw { status: 404, message: "Item not found" };
  }

  return item;
};

export const createItem = async (data) => {
  const { name, price, location, description, detailedDescription, path } = data;

  if (!name || price === undefined || !location || !description) {
    throw { status: 400, message: "Missing item fields." };
  }

  return await Item.create({
    name,
    price,
    location,
    description,
    detailedDescription,
    path,
  });
};

export const updateItem = async (itemId, data) => {
  const item = await Item.findByIdAndUpdate(itemId, data, { new: true });

  if (!item) {
    throw { status: 404, message: "Item not found." };
  }

  return item;
};

export const deleteItem = async (itemId) => {
  const item = await Item.findByIdAndDelete(itemId);

  if (!item) {
    throw { status: 404, message: "Item not found." };
  }

  return true;
};