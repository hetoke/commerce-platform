import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
      index: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },

    comment: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// 🚫 Prevent same user reviewing same item twice
reviewSchema.index({ item: 1, user: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
