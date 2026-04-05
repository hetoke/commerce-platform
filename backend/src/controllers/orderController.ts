import {
  cancelOrderService,
  createOrderService,
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

    const order = await createOrderService(req.user.id, purchaseIds, customerInfo);
    res.status(201).json(order);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
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
