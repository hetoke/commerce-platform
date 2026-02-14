import express from "express";
import {
  createItem,
  deleteItem,
  listAdminItems,
  listCustomerItems,
  updateItem,
  buyItem,
  cancelItem
} from "../controllers/itemsController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", listAdminItems);

router.get("/purchases", requireAuth, listCustomerItems);

router.post("/", requireAuth, requireAdmin, createItem);

router.post("/:itemId/buy", requireAuth, buyItem);

router.put("/:itemId", requireAuth, requireAdmin, updateItem);

router.delete("/:itemId", requireAuth, requireAdmin, deleteItem);

router.delete("/purchases/:itemId", requireAuth, cancelItem);

export default router;
