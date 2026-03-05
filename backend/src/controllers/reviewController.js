import Review from "../models/Review.js";
import Item from "../models/Item.js";
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

export const upsertReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { itemId } = req.params;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1–5." });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const existingReview = await Review.findOne({ item: itemId, user: req.user._id });

    let review;
    if (existingReview) {
      // Update review
      item.totalRating = item.totalRating - existingReview.rating + rating;
      review = await Review.findOneAndUpdate(
        { _id: existingReview._id },
        { rating, comment },
        { new: true, runValidators: true }
      ).populate("user", "name");
    } else {
      // New review
      review = await Review.create({
        item: itemId,
        user: req.user._id,
        rating,
        comment
      });
      item.reviewCount += 1;
      item.totalRating += rating;
      await review.populate("user", "name"); // populate user for frontend
    }

    await item.save();

    res.status(200).json(review);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to post review." });
  }
};