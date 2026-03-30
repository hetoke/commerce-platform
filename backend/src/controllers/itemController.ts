import * as itemService from "../services/itemService.ts";

export const listItems = async (req, res, next) => {
  try {
    const items = await itemService.listItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const getItemDetails = async (req, res, next) => {
  try {
    const item = await itemService.getItemDetails(req.params.itemId);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const createItem = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const item = await itemService.createItem(req.body);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(req.params.itemId, req.body);
    res.json(item);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    await itemService.deleteItem(req.params.itemId);
    res.json({ message: "Item deleted." });
  } catch (err) {
    next(err);
  }
};