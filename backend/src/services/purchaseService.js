import Item from "../models/Item.js";
import Purchase from "../models/Purchase.js";

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
    }));
};

export const createPurchaseService = async (userId, itemId) => {
  const item = await Item.findById(itemId);

  if (!item) {
    const err = new Error("Item not found.");
    err.status = 404;
    throw err;
  }

  const purchase = await Purchase.create({
    user: userId,
    item: item._id,
    priceAtPurchase: item.price,
  });

  await Item.updateOne(
    { _id: itemId },
    { $inc: { sellCount: 1 } }
  );

  return purchase;
};

export const cancelPurchaseService = async (userId, purchaseId) => {
  const deleted = await Purchase.findOneAndDelete({
    _id: purchaseId,
    user: userId,
  });

  if (!deleted) {
    const err = new Error("Purchase not found.");
    err.status = 404;
    throw err;
  }

  const item = await Item.findById(deleted.item);

  if (item && item.sellCount > 0) {
    await Item.updateOne(
      { _id: itemId },
      { $inc: { sellCount: -1 } }
    );
  }

  return deleted;
};