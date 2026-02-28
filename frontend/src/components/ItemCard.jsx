import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const ItemCard = ({ item }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const imageUrl = item.path
    ? `/uploads/${item.path}`
    : item.image ||
      "https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80";

  const handleBuy = async (e) => {
    e.preventDefault();      // 🔥 prevent navigation
    e.stopPropagation();     // 🔥 stop bubbling

    if (isBuying) return;

    try {
      setIsBuying(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/items/${item.id}/buy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || "Failed to purchase");
      } else {
        alert("Added to cart");
      }
    } catch {
      alert("Network error");
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
              ? `$${item.price}`
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

export default ItemCard;