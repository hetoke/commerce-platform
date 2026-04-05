import { useEffect, useState } from "react";
import Typewriter from "../components/Typewriter";
import { protectedFetch } from "../api/api";
import type { Order as OrderType } from "../types";

const statusLabelMap: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const statusClassMap: Record<string, string> = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  confirmed: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  shipping: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
  delivered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-500/40 bg-red-500/10 text-red-300",
};

function Order() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await protectedFetch("/api/orders");

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load orders.");
        }

        const data = (await response.json()) as OrderType[];
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    try {
      setCancelingId(orderId);
      setError("");

      const response = await protectedFetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => ({}))) as
        | OrderType
        | { message?: string };

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "message" in data && data.message
            ? data.message
            : "Failed to cancel order."
        );
      }

      const updatedOrder = data as OrderType;
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updatedOrder : order))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel order.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10">
      <h1 className="text-3xl font-semibold text-slate-100">
        <Typewriter text="Your Orders" />
      </h1>
      <p className="mt-3 text-slate-400">
        <Typewriter
          text="Orders created from the selected items in your cart appear here."
          speed={22}
          delay={250}
        />
      </p>

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          You have not created any orders yet.
        </p>
      ) : (
        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <section
              key={order.id}
              className="rounded-2xl border border-[#1f2937] bg-[#101621] p-5"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-100">
                      {order.id}
                    </h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        statusClassMap[order.status || "pending"] || statusClassMap.pending
                      }`}
                    >
                      {statusLabelMap[order.status || "pending"] || "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <span>
                    {order.totalQuantity} item(s) • ${order.totalPrice.toFixed(2)}
                  </span>
                  {["pending", "confirmed"].includes(order.status || "pending") && (
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancelingId === order.id}
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {cancelingId === order.id ? "Canceling..." : "Cancel Order"}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-[#1f2937] bg-[#0f141b] p-4 text-sm text-slate-300 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer Name
                  </p>
                  <p className="mt-1 text-slate-100">{order.customerInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Phone Number
                  </p>
                  <p className="mt-1 text-slate-100">{order.customerInfo.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment Method
                  </p>
                  <p className="mt-1 text-slate-100">{order.customerInfo.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Received Location
                  </p>
                  <p className="mt-1 text-slate-100">{order.customerInfo.receivedLocation}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {order.items.map((item) => (
                  <div
                    key={`${order.id}-${item.id}`}
                    className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0f141b] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.location}
                      </p>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                      <p>Qty: {item.quantity}</p>
                      <p>${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

export default Order;
