import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import type { OrderCustomerInfo, PurchaseItem } from "../types";

interface OrderFormProps {
  items: PurchaseItem[];
  onClose: () => void;
  onSubmit: (
    selectedItems: PurchaseItem[],
    customerInfo: OrderCustomerInfo,
  ) => boolean;
}

function OrderForm({ items, onClose, onSubmit }: OrderFormProps) {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [customerInfo, setCustomerInfo] = useState<OrderCustomerInfo>({
    name: user?.username || "",
    phoneNumber: "",
    receivedLocation: "",
    paymentMethod: "Cash on Delivery",
  });

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmit = () => {
    if (
      !customerInfo.name.trim() ||
      !customerInfo.phoneNumber.trim() ||
      !customerInfo.receivedLocation.trim() ||
      !customerInfo.paymentMethod.trim()
    ) {
      setError("Please fill in all customer information fields.");
      return;
    }

    const created = onSubmit(items, {
      name: customerInfo.name.trim(),
      phoneNumber: customerInfo.phoneNumber.trim(),
      receivedLocation: customerInfo.receivedLocation.trim(),
      paymentMethod: customerInfo.paymentMethod.trim(),
    });
    if (!created) {
      setError("Unable to create order.");
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-2xl rounded-2xl border border-[#1f2937] bg-[#101621] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Create Order</h2>
            <p className="mt-2 text-sm text-slate-400">
              Review the selected cart items before creating the order.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#2a3442] px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <div className="grid gap-4 rounded-xl border border-[#1f2937] bg-[#0f141b] p-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Customer's Name
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerInfo.phoneNumber}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Payment Method
              </label>
              <select
                value={customerInfo.paymentMethod}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
              >
                <option>Cash on Delivery</option>
                <option>Bank Transfer</option>
                <option>Credit Card</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Received Location
              </label>
              <textarea
                value={customerInfo.receivedLocation}
                onChange={(e) =>
                  setCustomerInfo((prev) => ({
                    ...prev,
                    receivedLocation: e.target.value,
                  }))
                }
                rows={3}
                className="mt-2 w-full rounded-lg border border-[#2a3442] bg-[#141a22] px-3 py-2 text-sm text-slate-100 focus:border-[#6f7cff] focus:outline-none"
              />
            </div>
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-[#1f2937] bg-[#0f141b] px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{item.name}</p>
                <p className="text-xs text-slate-500">{item.location}</p>
              </div>

              <div className="text-right text-xs text-slate-400">
                <p>Qty: {item.quantity}</p>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-[#1f2937] bg-[#0f141b] px-4 py-3 text-sm text-slate-300">
          <p>{totalQuantity} item(s)</p>
          <p className="mt-1 font-semibold text-slate-100">
            Total: ${totalPrice.toFixed(2)}
          </p>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#2a3442] px-4 py-2 text-sm font-semibold text-slate-300 hover:text-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#6f7cff] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
