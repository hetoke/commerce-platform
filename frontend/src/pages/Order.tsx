import Typewriter from "../components/Typewriter";
import type { Order as OrderType } from "../types";

interface OrderProps {
  orders: OrderType[];
}

function Order({ orders }: OrderProps) {
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

      {orders.length === 0 ? (
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
                  <h2 className="text-lg font-semibold text-slate-100">
                    {order.id}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Created: {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="text-sm text-slate-300">
                  {order.totalQuantity} item(s) • ${order.totalPrice.toFixed(2)}
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
