// routes/accountRoutes.js
import express from "express";
import { body } from "express-validator";
import { requireAuth } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validateRequest.js";
import {
  updateUsername,
  changePassword,
  getProfile,
} from "../controllers/accountController.js";

const router = express.Router();

/**
 * @route   PUT /api/account/update-username
 * @desc    Update username
 * @access  Private
 */
router.put(
  "/update-username",
  requireAuth,
  [
    body("userId")
      .notEmpty()
      .withMessage("User ID is required"),
    body("newUsername")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage("Username can only contain letters, numbers, underscores, and hyphens"),
  ],
  validateRequest,
  updateUsername
);

/**
 * @route   PUT /api/account/change-password
 * @desc    Change password
 * @access  Private
 */
router.put(
  "/change-password",
  requireAuth,
  [
    body("userId")
      .notEmpty()
      .withMessage("User ID is required"),
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  validateRequest,
  changePassword
);

/**
 * @route   GET /api/account/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", requireAuth, getProfile);

export default router;