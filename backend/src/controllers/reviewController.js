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