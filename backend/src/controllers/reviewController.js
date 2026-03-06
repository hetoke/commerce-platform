import { upsertReviewService,
         getItemReviewsService
} from "../services/reviewService.js";


export const getItemReviews = async (req, res, next) => {
  try {
    const reviews = await getItemReviewsService(req.params.itemId);
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const upsertReview = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { rating, comment } = req.body;

    if (comment && comment.length > 500) {
      return res.status(400).json({
        message: "Comment must be at most 500 characters"
      });
    }

    const review = await upsertReviewService({
      itemId,
      userId: req.user._id,
      rating,
      comment
    });

    res.json(review);
  } catch (err) {
    next(err);
  }
};