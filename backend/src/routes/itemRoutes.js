import express from "express";
import {
  createItem,
  deleteItem,
  listItems,
  listCustomerItems,
  updateItem,
  buyItem,
  cancelPurchase
} from "../controllers/itemsController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/", listItems);

/**
 * @swagger
 * /api/items/purchases:
 *   get:
 *     summary: Get current user's purchases
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of purchased items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Purchase'
 *       401:
 *         description: Unauthorized
 */
router.get("/purchases", requireAuth, listCustomerItems);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create new item (Admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       201:
 *         description: Item created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", requireAuth, requireAdmin, createItem);

/**
 * @swagger
 * /api/items/{itemId}/buy:
 *   post:
 *     summary: Buy an item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase successful
 *       401:
 *         description: Unauthorized
 */
router.post("/:itemId/buy", requireAuth, buyItem);

/**
 * @swagger
 * /api/items/{itemId}:
 *   put:
 *     summary: Update item (Admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       403:
 *         description: Forbidden
 */
router.put("/:itemId", requireAuth, requireAdmin, updateItem);

/**
 * @swagger
 * /api/items/{itemId}:
 *   delete:
 *     summary: Delete item (Admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete("/:itemId", requireAuth, requireAdmin, deleteItem);

/**
 * @swagger
 * /api/items/purchases/{itemId}:
 *   delete:
 *     summary: Cancel a purchase
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Purchase canceled
 *       404:
 *         description: Purchase not found
 */
router.delete("/purchases/:itemId", requireAuth, cancelPurchase);

export default router;
