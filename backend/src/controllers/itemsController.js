import fs from "fs";
import path from "path";
import User from "../models/User.js";

const getAdmin = async () => {
  return User.findOne({ role: "admin" });
};

export const listAdminItems = async (req, res) => {
  const admin = await getAdmin();
  //console.log(admin.items);
  return res.json(admin?.items || []);
};

export const listCustomerItems = async (req, res) => {
  try {
    const customer = await User.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({ message: "User not found." });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers allowed." });
    }

    return res.json(customer?.items || []);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch items." });
  }
};


export const createItem = async (req, res) => {
  const { name, price, location, description, path } = req.body || {};
  if (!name || price === undefined || !location || !description) {
    return res.status(400).json({ message: "Missing item fields." });
  }

  const admin = await User.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ message: "Admin user not found." });
  }

  const safePath =
    typeof path === "string" && path.startsWith("products/") ? path : undefined;
  admin.items.push({ name, price, location, description, path: safePath });
  await admin.save();
  return res.status(201).json(admin.items);
};

export const updateItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, price, location, description, path } = req.body || {};

  const admin = await User.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ message: "Admin user not found." });
  }

  const item = admin.items.id(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  if (name !== undefined) item.name = name;
  if (price !== undefined) item.price = price;
  if (location !== undefined) item.location = location;
  if (description !== undefined) item.description = description;
  if (path !== undefined) {
    item.path =
      typeof path === "string" && path.startsWith("products/") ? path : "";
  }

  await admin.save();
  return res.json(admin.items);
};

export const deleteItem = async (req, res) => {
  const { itemId } = req.params;
  const admin = await User.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ message: "Admin user not found." });
  }

  const item = admin.items.id(itemId);
  if (!item) {
    return res.status(404).json({ message: "Item not found." });
  }

  const filePath = item.path
    ? path.resolve(process.cwd(), "uploads", item.path)
    : null;
  if (filePath) {
    const uploadsRoot = path.resolve(process.cwd(), "uploads");
    if (filePath.startsWith(uploadsRoot) && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch {
        // ignore delete errors to avoid blocking item removal
      }
    }
  }

  admin.items.pull(itemId);
  await admin.save();
  return res.json(admin.items);
};

export const buyItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    // logged-in customer
    const customer = await User.findById(req.user.id);
    if (!customer) {
      return res.status(404).json({ message: "User not found." });
    }

    if (customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can buy items." });
    }

    // find product from admin
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      return res.status(500).json({ message: "Admin catalog missing." });
    }

    const item = admin.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    // optional: prevent duplicate purchase
    const alreadyOwned = customer.items.some(
      (i) => i.name === item.name
    );
    if (alreadyOwned) {
      return res.status(409).json({ message: "Item already purchased." });
    }

    // copy item into customer
    customer.items.push({
      name: item.name,
      price: item.price,
      location: item.location,
      description: item.description,
      path: item.path,
    });

    await customer.save();
    return res.status(201).json(customer.items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to buy item." });
  }
};

export const cancelItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can cancel purchases." });
    }

    // Check if item exists in purchases
    const existingItem = user.items.find(
      (item) => item._id.toString() === itemId
    );

    if (!existingItem) {
      return res.status(404).json({ message: "Purchase not found." });
    }

    // Remove item
    user.items = user.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await user.save();

    return res.json({ message: "Purchase canceled successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to cancel purchase." });
  }
};