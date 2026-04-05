import express from "express";
import { body, param, validationResult } from "express-validator";
import {
  cancelOrder,
  createOrder,
  handleVnpayIpn,
  handleVnpayReturn,
  listOrders,
} from "../controllers/orderController.ts";
import { requireAuth } from "../middleware/auth.ts";
import { csrfProtection } from "../middleware/csrf.ts";

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get current user's orders
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: List of orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       '401':
 *         description: Unauthorized
 */
router.get("/", requireAuth, listOrders);
router.get("/vnpay/return", handleVnpayReturn);
router.get("/vnpay/ipn", handleVnpayIpn);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create an order from selected cart purchases
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       '201':
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateOrderResponse'
 *       '400':
 *         description: Bad request
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Purchase not found
 */
router.post(
  "/",
  [
    body("purchaseIds")
      .isArray({ min: 1 })
      .withMessage("purchaseIds must be a non-empty array"),
    body("purchaseIds.*")
      .isMongoId()
      .withMessage("Each purchaseId must be a valid MongoDB ObjectId"),
    body("customerInfo.name")
      .trim()
      .notEmpty()
      .withMessage("Customer name is required"),
    body("customerInfo.phoneNumber")
      .trim()
      .notEmpty()
      .withMessage("Phone number is required"),
    body("customerInfo.receivedLocation")
      .trim()
      .notEmpty()
      .withMessage("Received location is required"),
    body("customerInfo.paymentMethod")
      .isIn(["Cash", "VNPay"])
      .withMessage("Payment method must be Cash or VNPay"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  requireAuth,
  csrfProtection,
  createOrder
);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: Cancel an order before shipping
 *     tags:
 *       - Order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Order cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       '400':
 *         description: Order can no longer be cancelled
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: Order not found
 */
router.delete(
  "/:orderId",
  [
    param("orderId")
      .isMongoId()
      .withMessage("Invalid orderId format"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  requireAuth,
  csrfProtection,
  cancelOrder
);

export default router;
