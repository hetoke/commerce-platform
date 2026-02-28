import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ItemDetail = () => {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/items/${itemId}`);
        const data = await res.json();
        setItem(data);
      } catch {
        alert("Failed to load item");
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) return <div className="p-6 text-slate-400">Loading...</div>;
  if (!item) return <div className="p-6 text-slate-400">Item not found</div>;

  const imageUrl = item.imagePath
    ? `/uploads/${item.imagePath}`
    : "https://images.unsplash.com/photo-1503602642458-232111445657?w=1200&q=80";

  return (
    <div className="max-w-6xl mx-auto p-6 text-slate-200">
      <div className="grid md:grid-cols-2 gap-10">
        
        {/* Image */}
        <div className="rounded-2xl overflow-hidden border border-[#1f2937]">
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-5">
          <h1 className="text-3xl font-bold">{item.name}</h1>

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
            ${item.price}
          </div>

          <div className="text-sm uppercase tracking-wide text-slate-500">
            {item.location}
          </div>

          <button className="mt-4 px-6 py-2 rounded-full bg-[#6f7cff] text-black font-semibold hover:opacity-90 transition">
            Buy Now
          </button>

          <div className="border-t border-[#1f2937] pt-6">
            <h2 className="text-lg font-semibold mb-2">Overview</h2>
            <p className="text-slate-400">{item.description}</p>
          </div>
        </div>
      </div>

      {/* Detailed Description */}
      <div className="mt-12 border-t border-[#1f2937] pt-8">
        <h2 className="text-xl font-semibold mb-4">
          Product Details
        </h2>
        <p className="text-slate-400 leading-relaxed whitespace-pre-line">
          {item.detailedDescription}
        </p>
      </div>
    </div>
  );
};

export default ItemDetail;