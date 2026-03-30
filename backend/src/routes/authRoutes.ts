import express from "express";
import {
  login,
  logout,
  signup,
  refresh,
  verifyMe,
  googleAuth,
} from "../controllers/authController.ts";
import { loginLimiter, signupLimiter } from "../middleware/rateLimitter.ts";
import { requireAuth } from "../middleware/auth.ts";
import { csrfProtection, generateCsrfToken } from "../middleware/csrf.ts";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get("/csrf-token", requireAuth, (req, res) => {
  try {
    const token = generateCsrfToken(req, res);
    res.json({ csrfToken: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate a user via Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleAuthRequest'
 *     responses:
 *       200:
 *         description: Google login successful – returns user data and sets auth cookies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid Google credential
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/google",  loginLimiter, googleAuth);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in with email/username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful – returns user data and sets auth cookies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error (e.g., missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", loginLimiter, login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user by clearing authentication cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */
router.post("/logout", csrfProtection, logout);

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully – returns user data and sets auth cookies
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error (e.g., missing fields, duplicate email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/signup",
  [
    body("username")
      .exists()
      .isLength({ min: 3 }),

    body("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format"),

    body("password")
      .exists()
      .isLength({ min: 6 }),

    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    }
  ],
  signupLimiter,
  signup
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the access token using a valid refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access and refresh tokens issued – cookies are updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RefreshResponse'
 *       403:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", csrfProtection, refresh);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Authenticated user's profile information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized – missing or invalid authentication token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", requireAuth, verifyMe);

export default router;