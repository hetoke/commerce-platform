import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { protectedFetch } from "../api/api.js";

const ItemCard = ({ item, onToast }) => {
  const [toast, setToast] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const imageUrl = item.path
    ? item.path
    : item.image ||
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80";

  const handleBuy = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isBuying) return;

    try {
      setIsBuying(true);

      const res = await protectedFetch(`/api/purchases`, {
        method: "POST",
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1
        }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 409) {
          onToast?.({ message: "Item already purchased", type: "warning" });
        } else {
          onToast?.({ message: data.message || "Failed to purchase", type: "error" });
        }
      } else {
        onToast?.({ message: "Item purchased successfully!", type: "success" });
        // Optionally refresh the page or update context
      }
    } catch (error) {
      onToast?.({ message: "Network error - please try again", type: "error" });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <Link
      to={`/items/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-[#1f2937] bg-[#0f141b] transition hover:border-[#2a3442] cursor-pointer"
    >
      <div className="relative w-full overflow-hidden bg-[#101621] aspect-[4/3]">
        <img
          src={imageUrl}
          alt={item.name}
          loading="lazy"
          decoding="async"
          width="800"
          height="600"
          onLoad={() => setIsLoaded(true)}
          className={`block h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } transition-opacity`}
        />
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100">
            {item.name}
          </h3>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            {item.location}
          </p>
        </div>

        <p className="text-sm text-slate-400 line-clamp-2">
          {item.description}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★</span>
            <span>
              {item.averageRating?.toFixed(1) || "0.0"}
            </span>
            <span>({item.reviewCount || 0})</span>
          </div>

          <div>
            {item.sellCount || 0} sold
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-semibold text-slate-100">
            {typeof item.price === "number"
              ? `$${item.price.toFixed(2)}`
              : item.price}
          </span>

          <button
            onClick={handleBuy}
            disabled={isBuying}
            className={`rounded-full border border-[#2a3442] px-3 py-1 text-xs font-semibold transition
              ${
                isBuying
                  ? "bg-[#0f141b] text-slate-500 cursor-not-allowed"
                  : "bg-[#141a22] text-slate-200 hover:border-[#6f7cff] hover:bg-[#182130]"
              }`}
          >
            {isBuying ? "Buying..." : "Buy"}
          </button>
        </div>
      </div>
    </Link>
  );
};

// Add PropTypes for better development experience
ItemCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    location: PropTypes.string,
    description: PropTypes.string,
    path: PropTypes.string,
    image: PropTypes.string,
    averageRating: PropTypes.number,
    reviewCount: PropTypes.number,
    sellCount: PropTypes.number,
    price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  onToast: PropTypes.func,
};

export default ItemCard;
