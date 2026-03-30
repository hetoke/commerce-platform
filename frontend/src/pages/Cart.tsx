import { useEffect, useState } from "react";
import Typewriter from "../components/Typewriter";
import { protectedFetch } from "../api/api";
import type { PurchaseItem } from "../types";

function Cart() {
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const response = await protectedFetch("/api/purchases");

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch purchases.");
        }

        const data = (await response.json()) as PurchaseItem[];
        setItems(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch purchases.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      setLoadingId(id);

      const response = await protectedFetch(
        `/api/purchases/${id}`,
        { method: "DELETE" }
      );

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to cancel purchase.");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel purchase.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        <Typewriter text="Your Account" />
      </h1>
      <p className="mt-3 text-slate-400">
        <Typewriter
          text="Manage your purchased items below."
          speed={22}
          delay={250}
        />
      </p>

      {error && (
        <p className="mt-6 text-sm text-red-400">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading purchases...</p>
      ) : items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          You haven't purchased any items yet.
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between rounded-xl border border-[#1f2937] bg-[#101621] p-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-100">
                    {item.name}
                  </p>
                  {item.quantity > 1 && (
                    <span className="text-xs bg-[#1f2937] text-slate-400 px-2 py-1 rounded-full">
                      x{item.quantity}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  {item.location} • ${item.price}
                  {item.quantity > 1 && (
                    <span className="ml-1">
                      (${(item.price * item.quantity).toFixed(2)} total)
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Purchased: {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleCancel(item.id)}
                disabled={loadingId === item.id}
                className="rounded-full border border-[#2a3442] px-3 py-1 text-xs font-semibold text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50 self-center"
              >
                {loadingId === item.id ? "Canceling..." : "Cancel"}
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default Cart;
