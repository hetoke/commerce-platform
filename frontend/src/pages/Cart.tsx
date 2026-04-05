import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OrderForm from "../components/OrderForm";
import Typewriter from "../components/Typewriter";
import { protectedFetch } from "../api/api";
import type { OrderCustomerInfo, PurchaseItem } from "../types";

function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);

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

    void fetchPurchases();
  }, []);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedItems = items.filter((item) => selectedSet.has(item.id));
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const toggleItem = (itemId: string) => {
    setError("");
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const toggleAll = () => {
    setError("");
    setSelectedIds((prev) =>
      prev.length === items.length ? [] : items.map((item) => item.id),
    );
  };

  const handleCancel = async (id: string) => {
    try {
      setLoadingId(id);
      setError("");

      const response = await protectedFetch(`/api/purchases/${id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to cancel purchase.");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel purchase.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleCreateOrderClick = () => {
    if (selectedItems.length === 0) {
      setError("Choose at least one item to create an order.");
      return;
    }

    setError("");
    setIsOrderFormOpen(true);
  };

  const handleOrderSubmit = async (customerInfo: OrderCustomerInfo) => {
    try {
      setError("");

      const response = await protectedFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          purchaseIds: selectedItems.map((item) => item.id),
          customerInfo,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (response.status === 401) {
        window.location.href = "/login";
        return false;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to create order.");
      }

      setItems((prev) => prev.filter((item) => !selectedSet.has(item.id)));
      setSelectedIds([]);
      navigate("/order");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create order.");
      return false;
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        <Typewriter text="Your Cart" />
      </h1>
      <p className="mt-3 text-slate-400">
        <Typewriter
          text="Choose multiple purchased items here, create one order, or cancel them individually."
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
          Your cart is empty.
        </p>
      ) : (
        <>
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-[#1f2937] bg-[#101621] px-4 py-3">
            <label className="flex items-center gap-3 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={items.length > 0 && selectedIds.length === items.length}
                onChange={toggleAll}
                className="h-4 w-4 accent-[#6f7cff]"
              />
              Select all
            </label>

            <button
              type="button"
              onClick={handleCreateOrderClick}
              className="rounded-full bg-[#6f7cff] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
            >
              Create Order ({selectedIds.length}){selectedTotal > 0 ? ` - $${selectedTotal.toFixed(2)}` : ""}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-xl border border-[#1f2937] bg-[#101621] p-4 sm:flex-row sm:items-center"
              >
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    className="h-4 w-4 accent-[#6f7cff]"
                  />
                </label>

                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-100">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.location} • ${item.price.toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Qty: {item.quantity} • Total: ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Added: {new Date(item.purchasedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleCancel(item.id)}
                  disabled={loadingId === item.id}
                  className="self-start rounded-full border border-[#2a3442] px-3 py-1 text-xs font-semibold text-slate-400 hover:border-red-500 hover:text-red-400 disabled:opacity-50 sm:self-center"
                >
                  {loadingId === item.id ? "Canceling..." : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {isOrderFormOpen && (
        <OrderForm
          items={selectedItems}
          onClose={() => setIsOrderFormOpen(false)}
          onSubmit={handleOrderSubmit}
        />
      )}
    </main>
  );
}

export default Cart;
