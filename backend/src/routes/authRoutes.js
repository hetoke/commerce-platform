import express from "express";
import { login, logout, signup, refresh, verifyMe, googleAuth } from "../controllers/authController.js";
import { loginLimiter, signupLimiter } from "../middleware/rateLimitter.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/google", loginLimiter, googleAuth);

router.post("/login", loginLimiter, login);

router.post("/logout", logout);

router.post("/signup", signupLimiter, signup);

router.post("/refresh", refresh);

router.get("/me", requireAuth, verifyMe);

export default router;
