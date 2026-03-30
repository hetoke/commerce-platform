// @ts-nocheck
import Item from "../models/Item.ts";
import Purchase from "../models/Purchase.ts";
import mongoose from "mongoose";

export const listCustomerItemsService = async (userId) => {
  const purchases = await Purchase.find({ user: userId })
    .populate("item")
    .lean();

  return purchases
    .filter(p => p.item)
    .map(p => ({
      id: p._id,
      itemId: p.item._id,
      name: p.item.name,
      price: p.item.price,
      location: p.item.location,
      description: p.item.description,
      path: p.item.imagePath,
      purchasedAt: p.createdAt,
      quantity: p.quantity, // Add this line
      priceAtPurchase: p.priceAtPurchase, // Might be useful too
    }));
};


export const createPurchaseService = async (userId, itemId, quantity = 1) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Always create a new purchase record (don't merge)
    const purchase = await Purchase.create([{
      user: userId,
      item: item._id,
      quantity: quantity,
      priceAtPurchase: item.price,
    }], { session });
    
    // Update item sell count
    await Item.updateOne(
      { _id: itemId },
      { $inc: { sellCount: quantity } }
    ).session(session);

    await session.commitTransaction();
    return purchase[0]; // create() returns an array
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelPurchaseService = async (userId, purchaseId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const purchase = await Purchase.findOneAndDelete({
      _id: purchaseId,
      user: userId,
    }).session(session);

    if (!purchase) {
      const err = new Error("Purchase not found.");
      err.status = 404;
      throw err;
    }

    // Update item sell count
    await Item.updateOne(
      { _id: purchase.item, sellCount: { $gt: 0 } },
      { $inc: { sellCount: -purchase.quantity } }
    ).session(session);

    await session.commitTransaction();
    return purchase;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

