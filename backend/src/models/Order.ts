import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [
        (value: unknown[]) => Array.isArray(value) && value.length > 0,
        "Order must contain at least one item.",
      ],
    },
    customerInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      phoneNumber: {
        type: String,
        required: true,
        trim: true,
      },
      receivedLocation: {
        type: String,
        required: true,
        trim: true,
      },
      paymentMethod: {
        type: String,
        enum: ["Cash", "VNPay"],
        required: true,
        default: "Cash",
      },
    },
    totalQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "failed"],
      default: "unpaid",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    sellCountApplied: {
      type: Boolean,
      default: false,
      index: true,
    },
    vnpay: {
      txnRef: {
        type: String,
        default: null,
      },
      transactionNo: {
        type: String,
        default: null,
      },
      bankCode: {
        type: String,
        default: null,
      },
      responseCode: {
        type: String,
        default: null,
      },
      payUrl: {
        type: String,
        default: null,
      },
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
