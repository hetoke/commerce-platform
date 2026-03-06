// routes/reviewRoutes.js
import express from "express";
import {
  getItemReviews,
  upsertReview,
} from "../controllers/reviewController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /api/items/{itemId}/reviews:
 *   get:
 *     summary: Get all reviews for a specific item
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item identifier
 *     responses:
 *       200:
 *         description: List of reviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       400:
 *         description: Invalid item ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:itemId/reviews', getItemReviews);

/**
 * @swagger
 * /api/items/{itemId}/reviews:
 *   post:
 *     summary: Create or update a review for an item (upsert)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: Item identifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpsertReviewRequest'
 *     responses:
 *       200:
 *         description: Review created/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: Validation error (e.g., missing/invalid rating)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:itemId/reviews', requireAuth, upsertReview);

export default router;
