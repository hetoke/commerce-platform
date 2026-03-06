import express from "express";
import {
  createItem,
  deleteItem,
  listItems,
  getItemDetails,
  updateItem
} from "../controllers/itemController.js";

import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Retrieve all items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: An array of items
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
 * /api/items/{itemId}:
 *   get:
 *     summary: Retrieve a single item by ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item identifier
 *     responses:
 *       200:
 *         description: Item object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Invalid item ID
 *       404:
 *         description: Item not found
 */
router.get("/:itemId", getItemDetails);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item (Admin only)
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Missing or invalid fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post("/", requireAuth, requireAdmin, createItem);

/**
 * @swagger
 * /api/items/{itemId}:
 *   put:
 *     summary: Update an existing item (Admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateItemRequest'
 *     responses:
 *       200:
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Item not found
 */
router.put("/:itemId", requireAuth, requireAdmin, updateItem);

/**
 * @swagger
 * /api/items/{itemId}:
 *   delete:
 *     summary: Delete an item (Admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the item to delete
 *     responses:
 *       200:
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Item not found
 */
router.delete("/:itemId", requireAuth, requireAdmin, deleteItem);

export default router;
