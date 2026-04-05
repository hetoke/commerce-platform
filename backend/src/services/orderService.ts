// @ts-nocheck
import mongoose from "mongoose";
import Item from "../models/Item.ts";
import Order from "../models/Order.ts";
import Purchase from "../models/Purchase.ts";
import { createVnpayPayment, verifyVnpaySignature } from "./vnpayService.ts";

const mapOrder = (order) => ({
  id: order._id,
  items: order.items.map((item) => ({
    id: item.item,
    name: item.name,
    location: item.location,
    price: item.priceAtPurchase,
    quantity: item.quantity,
    purchasedAt: order.createdAt,
  })),
  totalQuantity: order.totalQuantity,
  totalPrice: order.totalPrice,
  createdAt: order.createdAt,
  customerInfo: {
    name: order.customerInfo.name,
    phoneNumber: order.customerInfo.phoneNumber,
    receivedLocation: order.customerInfo.receivedLocation,
    paymentMethod: order.customerInfo.paymentMethod,
  },
  paymentStatus: order.paymentStatus,
  status: order.status,
  vnpay: order.vnpay
    ? {
        txnRef: order.vnpay.txnRef,
        transactionNo: order.vnpay.transactionNo,
        bankCode: order.vnpay.bankCode,
        responseCode: order.vnpay.responseCode,
        payUrl: order.vnpay.payUrl,
      }
    : undefined,
});

export const listOrdersService = async (userId) => {
  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return orders.map(mapOrder);
};

export const createOrderService = async (userId, purchaseIds, customerInfo) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchases = await Purchase.find({
      _id: { $in: purchaseIds },
      user: userId,
    })
      .populate("item")
      .session(session);

    if (purchases.length !== purchaseIds.length) {
      const err = new Error("Some purchases were not found.");
      err.status = 404;
      throw err;
    }

    const missingItems = purchases.find((purchase) => !purchase.item);
    if (missingItems) {
      const err = new Error("One or more purchased items are no longer available.");
      err.status = 400;
      throw err;
    }

    const orderItems = purchases.map((purchase) => ({
      item: purchase.item._id,
      name: purchase.item.name,
      location: purchase.item.location,
      quantity: purchase.quantity,
      priceAtPurchase: purchase.priceAtPurchase,
    }));

    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = orderItems.reduce(
      (sum, item) => sum + item.quantity * item.priceAtPurchase,
      0
    );

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          customerInfo,
          totalQuantity,
          totalPrice,
          paymentStatus: customerInfo.paymentMethod === "Cash" ? "unpaid" : "unpaid",
        },
      ],
      { session }
    );

    let payment = null;

    if (customerInfo.paymentMethod === "VNPay") {
      payment = createVnpayPayment({ order });
      order.vnpay = {
        txnRef: payment.txnRef,
        transactionNo: null,
        bankCode: null,
        responseCode: null,
        payUrl: payment.payUrl,
      };
      await order.save({ session });
    }

    const sellCountOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.item },
        update: { $inc: { sellCount: item.quantity } },
      },
    }));

    if (sellCountOps.length > 0) {
      await Item.bulkWrite(sellCountOps, { session });
    }

    await Purchase.deleteMany({
      _id: { $in: purchaseIds },
      user: userId,
    }).session(session);

    await session.commitTransaction();

    return {
      order: mapOrder(order.toObject()),
      payment,
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const cancelOrderService = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  });

  if (!order) {
    const err = new Error("Order not found.");
    err.status = 404;
    throw err;
  }

  if (!["pending", "confirmed"].includes(order.status)) {
    const err = new Error("Order can only be cancelled before shipping.");
    err.status = 400;
    throw err;
  }

  order.status = "cancelled";
  await order.save();

  return mapOrder(order.toObject());
};

export const handleVnpayIpnService = async (payload) => {
  const isValidSignature = verifyVnpaySignature(payload);
  if (!isValidSignature) {
    const err = new Error("Invalid VNPay signature.");
    err.status = 400;
    throw err;
  }

  const order = await Order.findById(payload.vnp_TxnRef);

  if (!order) {
    const err = new Error("Order not found.");
    err.status = 404;
    throw err;
  }

  const expectedTmnCode = process.env.VNPAY_TMN_CODE;
  if (expectedTmnCode && payload.vnp_TmnCode !== expectedTmnCode) {
    const err = new Error("Invalid terminal code.");
    err.status = 400;
    throw err;
  }

  if (Number(payload.vnp_Amount) !== Math.round(order.totalPrice * 100)) {
    const err = new Error("Amount mismatch.");
    err.status = 400;
    throw err;
  }

  order.vnpay = {
    txnRef: payload.vnp_TxnRef,
    transactionNo: payload.vnp_TransactionNo || null,
    bankCode: payload.vnp_BankCode || null,
    responseCode: payload.vnp_ResponseCode || null,
    payUrl: order.vnpay?.payUrl || null,
  };
  order.paymentStatus =
    payload.vnp_ResponseCode === "00" && payload.vnp_TransactionStatus === "00"
      ? "paid"
      : "failed";
  await order.save();

  return order;
};
