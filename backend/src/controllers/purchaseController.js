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
    const { itemId, quantity = 1 } = req.body;
    
    if (!itemId) {
      return res.status(400).json({ message: "Item ID is required." });
    }
    
    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    const purchase = await createPurchaseService(
      req.user.id,
      itemId,
      quantity
    );

    res.status(201).json(purchase);
  } catch (err) {
    // Remove the DuplicateKey check since it's no longer relevant
    if (err.status === 404) {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
};

export const cancelPurchase = async (req, res, next) => {
  try {
    const result = await cancelPurchaseService(
      req.user.id, 
      req.params.purchaseId
    );
    
    res.json({ 
      message: "Purchase canceled successfully.",
      purchase: result 
    });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ message: err.message });
    }
    next(err);
  }
};
