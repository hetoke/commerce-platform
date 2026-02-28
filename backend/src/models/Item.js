import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },

    location: {
      type: String,
      required: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    detailedDescription: {
      type: String
    },

    imagePath: {
      type: String
    },

    // 🔥 Fast counters
    totalRating: {
      type: Number,
      default: 0
    },

    reviewCount: {
      type: Number,
      default: 0
    },

    sellCount: {
      type: Number,
      default: 0,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// ⭐ Computed field (not stored in DB)
itemSchema.virtual("averageRating").get(function () {
  if (this.reviewCount === 0) return 0;
  return Number((this.totalRating / this.reviewCount).toFixed(2));
});

// Include virtuals in API responses
itemSchema.set("toJSON", { virtuals: true });
itemSchema.set("toObject", { virtuals: true });

export default mongoose.model("Item", itemSchema);