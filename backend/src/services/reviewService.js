import mongoose from "mongoose";
import Review from "../models/Review.js";
import Item from "../models/Item.js";
import { updateItemRating } from "./ratingService.js";

export const getItemReviewsService = async (itemId) => {
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    const err = new Error("Invalid item ID");
    err.status = 400;
    throw err;
  }

  const reviews = await Review.find({ item: itemId })
    .populate("user", "username")
    .sort({ createdAt: -1 })
    .lean();

  return reviews;
};

export const upsertReviewService = async ({ itemId, userId, rating, comment }) => {

  const item = await Item.findById(itemId);
  if (!item) throw new Error("Item not found");

  const existing = await Review.findOne({ item: itemId, user: userId });

  let review;

  if (existing) {
    review = await Review.findByIdAndUpdate(
      existing._id,
      { rating, comment },
      { new: true }
    );

    await updateItemRating(item, rating, existing.rating);

  } else {

    review = await Review.create({
      item: itemId,
      user: userId,
      rating,
      comment
    });

    await updateItemRating(item, rating, null);
  }

  return review.populate("user", "username");
};