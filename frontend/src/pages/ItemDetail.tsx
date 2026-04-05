import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LoadingScreen from "../components/LoadingScreen";
import Typewriter from "../components/Typewriter";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import { publicFetch, protectedFetch } from "../api/api";
import type { Item, Review, ToastPayload } from "../types";
import { formatVnd } from "../utils/currency";

function ItemDetail() {
  const { itemId } = useParams();
  const { user, authLoading } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastPayload | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!loading) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, reviewRes] = await Promise.all([
          publicFetch(`/api/items/${itemId}`),
          publicFetch(`/api/items/${itemId}/reviews`)
        ]);

        const itemData = (await itemRes.json()) as Item;
        const reviewData = (await reviewRes.json()) as Review[];

        setItem(itemData);
        setReviews(reviewData);
      } catch {
        alert("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId]);

  if (loading || authLoading) return <LoadingScreen />;
  if (!item) return <div className="p-6 text-slate-400">Item not found</div>;

  const addToCartHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!user) {
      return setToast({
        message: "Please log in to add this item to cart.",
        type: "error",
      });
    }
    if (user.role === "admin") {
      return setToast({
        message: "Admin accounts cannot add items to cart.",
        type: "warning",
      });
    }

    try {
      setIsSubmitting(true);
      const res = await protectedFetch(`/api/purchases`, {
        method: "POST",
        body: JSON.stringify({
          itemId: item.id,
          quantity,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("Item already in cart.");
        }
        throw new Error(data.message || "Failed to add item to cart.");
      }

      setToast({
        message: `${quantity} item(s) added to cart.`,
        type: "success",
      });
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : "Failed to add item to cart.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      setSubmitError("Please select a rating.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await protectedFetch(`/api/items/${itemId}/reviews`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to post review.");
      }

      const newReview = (await res.json()) as Review;

      setReviews((prev) => {
        const filtered = prev.filter((r) => r._id !== newReview._id);
        return [newReview, ...filtered];
      });

      // reset form
      setRating(0);
      setComment("");

    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to post review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageUrl = item.imagePath
    ? item.imagePath
    : "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80";
  const unitPrice =
    typeof item.price === "number" ? item.price : Number(item.price);

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-200">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-[#1f2937] w-72 h-72">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-5">

          <h1 className="text-3xl font-bold">
            <Typewriter text={item.name} />
          </h1>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="text-yellow-400">★</span>
            <span>
              {item.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span>({item.reviewCount || 0} reviews)</span>
            <span>•</span>
            <span>{item.sellCount || 0} sold</span>
          </div>

          <div className="text-2xl font-semibold">
            <Typewriter text={formatVnd(item.price)} />
          </div>

          <div className="text-sm uppercase tracking-wide text-slate-500">
            {item.location}
          </div>

          {/* Quantity Selector + Cart Button */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center border border-[#2a3442] rounded-full">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-slate-400 hover:text-white"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-slate-400 hover:text-white"
              >
                +
              </button>
            </div>

            <button 
              className="px-6 py-2 rounded-full bg-[#6f7cff] text-black font-semibold hover:opacity-90 transition disabled:opacity-50"
              onClick={addToCartHandler}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : `Add to Cart (${formatVnd(unitPrice * quantity)})`}
            </button>
          </div>

          <div className="border-t border-[#1f2937] pt-6">
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p className="text-slate-400">{item.description}</p>
          </div>
        </div>
      </div>

      {/* Rest of your component remains the same... */}
      
      {/* Detailed Description */}
      <div className="mt-12 border-t border-[#1f2937] pt-8">
        <h2 className="text-xl font-semibold mb-4">
          Product Details
        </h2>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {item.detailedDescription?.replace(/\\n/g, "\n")}
          </ReactMarkdown>
        </div>
      </div>

      {/* Reviews section remains unchanged... */}
      
      {/* Add Review Form */}
      <div className="mt-12 border-t border-[#1f2937] pt-8">
        <h2 className="text-xl font-semibold mb-6">
          Write a Review
        </h2>

        {!user ? (
          <p className="text-slate-500">
            <a
              href="/login"
              className="text-[#6f7cff] hover:underline"
            >
              Log in
            </a>{" "}
            to leave a comment.
          </p>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4 max-w-xl">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`
                    text-2xl
                    ${rating >= star ? "text-yellow-400" : "text-slate-500"}
                    hover:text-yellow-400
                  `}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your experience…"
              rows={4}
              className="
                w-full rounded-md border border-[#2a3442] bg-[#141a22] 
                px-3 py-2 text-sm text-slate-100 
                focus:border-[#6f7cff] focus:outline-none
              "
              required
            />

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  rounded-full bg-[#6f7cff] px-4 py-2 text-sm font-semibold text-black
                  hover:opacity-90 disabled:opacity-50
                "
              >
                {isSubmitting ? "Posting…" : "Post Review"}
              </button>

              {submitError && (
                <p className="text-sm text-red-400">{submitError}</p>
              )}
            </div>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="mt-12 border-t border-[#1f2937] pt-8">
        <h2 className="text-xl font-semibold mb-6">
          Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 && (
          <p className="text-slate-500">No reviews yet.</p>
        )}

        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="border-b border-[#1f2937] pb-4"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {review.user?.username || "Anonymous"}
                </span>

                <span className="text-yellow-400">{"★".repeat(review.rating)}</span>
              </div>

              <p className="text-slate-400 mt-2">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
