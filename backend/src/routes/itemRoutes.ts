import express from "express";
import {
  createItem,
  deleteItem,
  listItems,
  getItemDetails,
  updateItem
} from "../controllers/itemController.ts";

import { requireAdmin, requireAuth } from "../middleware/auth.ts";
import { csrfProtection } from "../middleware/csrf.ts";
import { param, body, validationResult } from "express-validator";

const router = express.Router();


/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Retrieve all items
 *     tags:
 *       - Items
 *     responses:
 *       '200':
 *         description: A list of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 *       '500':
 *         description: Internal server error
 */
router.get("/", listItems);

/**
 * @swagger
 * /api/items/{itemId}:
 *   get:
 *     summary: Retrieve a single item by ID
 *     tags:
 *       - Items
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item identifier
 *     responses:
 *       '200':
 *         description: Item details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       '400':
 *         description: Validation error
 *       '404':
 *         description: Item not found
 *       '500':
 *         description: Internal server error
 */
router.get("/:itemId", getItemDetails);

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create a new item (Admin only)
 *     tags:
 *       - Items
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateItemRequest'
 *     responses:
 *       '201':
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden (Admin only)
 *       '500':
 *         description: Internal server error
 */
router.post("/", requireAuth, requireAdmin, csrfProtection, createItem);



/**
 * @swagger
 * /api/items/{itemId}:
 *   put:
 *     summary: Update an existing item (Admin only)
 *     tags:
 *       - Items
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
 *       '200':
 *         description: Item updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden (Admin only)
 *       '404':
 *         description: Item not found
 *       '500':
 *         description: Internal server error
 */
router.put(
  "/:itemId",
  [
    param("itemId").isMongoId(),

    body("name")
      .optional()
      .isLength({ min: 3, max: 100 }),

    body("price")
      .optional()
      .isFloat({ min: 0 }),

    body("location")
      .optional()
      .isLength({ min: 2 }),

    body()
      .custom(body => Object.keys(body).length > 0)
      .withMessage("Request body cannot be empty"),

    (req, res, next) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      next()
    }
  ],
  requireAuth,
  requireAdmin,
  csrfProtection,
  updateItem
)

/**
 * @swagger
 * /api/items/{itemId}:
 *   delete:
 *     summary: Delete an item (Admin only)
 *     tags:
 *       - Items
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
 *       '200':
 *         description: Item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Item deleted."
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: Forbidden (Admin only)
 *       '404':
 *         description: Item not found
 *       '500':
 *         description: Internal server error
 */
router.delete(
  "/:itemId",
  [
    param("itemId")
      .exists()
      .withMessage("itemId is required")
      .isMongoId()
      .withMessage("itemId must be a valid MongoDB ObjectId"),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  requireAuth,
  requireAdmin,
  csrfProtection,
  deleteItem
);

export default router;