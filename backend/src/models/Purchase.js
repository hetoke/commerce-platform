import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true,
    },

    priceAtPurchase: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

purchaseSchema.index({ user: 1, item: 1 }, { unique: true });

export default mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema);
