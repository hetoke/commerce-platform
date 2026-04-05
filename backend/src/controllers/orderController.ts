import {
  cancelOrderService,
  createOrderService,
  handleVnpayIpnService,
  listOrdersService,
} from "../services/orderService.ts";

export const listOrders = async (req, res, next) => {
  try {
    const orders = await listOrdersService(req.user.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const { purchaseIds, customerInfo } = req.body;

    const result = await createOrderService(req.user.id, purchaseIds, customerInfo);
    res.status(201).json(result);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};

export const handleVnpayIpn = async (req, res, next) => {
  try {
    await handleVnpayIpnService(req.query);
    res.status(200).json({ RspCode: "00", Message: "success" });
  } catch (err) {
    if (err.status) {
      if (err.message === "Order not found.") {
        return res.status(200).json({ RspCode: "01", Message: err.message });
      }
      if (err.message === "Amount mismatch.") {
        return res.status(200).json({ RspCode: "04", Message: err.message });
      }
      if (err.message === "Invalid VNPay signature.") {
        return res.status(200).json({ RspCode: "97", Message: err.message });
      }
      return res.status(200).json({ RspCode: "99", Message: err.message });
    }
    next(err);
  }
};

export const handleVnpayReturn = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const params = new URLSearchParams();

  try {
    await handleVnpayIpnService(req.query);
  } catch {
    // IPN remains the source of truth. The return handler only tries to
    // persist the callback early so the redirected order page is up to date.
  }

  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  res.redirect(`${frontendUrl}/order?${params.toString()}`);
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await cancelOrderService(req.user.id, req.params.orderId);
    res.json(order);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
};
