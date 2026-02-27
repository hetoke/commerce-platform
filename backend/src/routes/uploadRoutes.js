import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload } from "../config/multer.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();


/**
 * @swagger
 * /api/uploads/image:
 *   post:
 *     summary: Upload image (Admin only)
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 path:
 *                   type: string
 *                   example: products/abc123.jpg
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post(
  "/image",
  requireAuth,
  requireAdmin,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    return res.status(201).json({
      path: `products/${req.file.filename}`,
    });
  }
);


export default router;
