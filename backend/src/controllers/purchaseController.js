import {
  listCustomerItemsService,
  createPurchaseService,
  cancelPurchaseService
} from "../services/purchaseService.js";

export const listCustomerItems = async (req, res, next) => {
  try {
    const items = await listCustomerItemsService(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const createPurchase = async (req, res, next) => {
  try {
    const purchase = await createPurchaseService(
      req.user.id,
      req.body.itemId
    );

    res.status(201).json(purchase);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Item already purchased." });
    }
    next(err);
  }
};

export const cancelPurchase = async (req, res, next) => {
  try {
    await cancelPurchaseService(req.user.id, req.params.purchaseId);
    res.json({ message: "Purchase canceled successfully." });
  } catch (err) {
    next(err);
  }
};