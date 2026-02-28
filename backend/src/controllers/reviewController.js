import Review from "../models/Review.js";
import mongoose from "mongoose";

export const getItemReviews = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const reviews = await Review.find({ item: itemId })
      .populate("user", "username")
      .sort({ createdAt: -1 })
      .lean();

    return res.json(reviews);
  } catch (err) {
    next(err);
  }
};