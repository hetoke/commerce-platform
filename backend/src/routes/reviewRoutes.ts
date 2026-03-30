import express from "express";
import {
  getItemReviews,
  upsertReview,
} from "../controllers/reviewController.ts";
import { requireAuth } from "../middleware/auth.ts";
import { csrfProtection } from "../middleware/csrf.ts";
import {
  param,
  body,
  validationResult
} from "express-validator";

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
 *       404:
 *         description: Item not found
 */
router.get("/:itemId/reviews", getItemReviews);

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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Item not found
 */
router.post(
  "/:itemId/reviews",
  [
    param("itemId").isMongoId(),
    body("rating")
      .exists()
      .withMessage("Rating is required")
      .isNumeric()
      .withMessage("Rating must be a number")
      .isInt({ min: 1, max: 5 }),
    body("comment")
      .optional()
      .isLength({ max: 500 }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  requireAuth,
  csrfProtection,
  upsertReview
);

export default router;