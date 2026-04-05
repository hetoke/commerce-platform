// @ts-nocheck
import crypto from "crypto";

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    const err = new Error(`Missing required environment variable: ${name}`);
    err.status = 500;
    throw err;
  }
  return value;
};

const buildSortedParams = (params) => {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const normalized = {};
  for (const [key, value] of entries) {
    normalized[key] = String(value);
  }
  return normalized;
};

const buildQueryString = (params) =>
  new URLSearchParams(buildSortedParams(params)).toString();

const signParams = (params) => {
  const secret = getRequiredEnv("VNPAY_HASH_SECRET");
  return crypto
    .createHmac("sha512", secret)
    .update(buildQueryString(params), "utf-8")
    .digest("hex");
};

export const createVnpayPayment = ({ order }) => {
  const tmnCode = getRequiredEnv("VNPAY_TMN_CODE");
  const returnUrl = getRequiredEnv("VNPAY_RETURN_URL");
  const paymentUrl = process.env.VNPAY_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const locale = process.env.VNPAY_LOCALE || "vn";
  const currCode = process.env.VNPAY_CURRENCY || "VND";
  const orderType = process.env.VNPAY_ORDER_TYPE || "other";
  const createDate = new Date();
  const expireInMinutes = Number(process.env.VNPAY_EXPIRE_MINUTES || 15);
  const expireDate = new Date(createDate.getTime() + expireInMinutes * 60 * 1000);
  const txnRef = String(order._id);

  const amountValue = Math.round(Number(order.totalPrice) * 100);
  if (!Number.isFinite(amountValue) || amountValue <= 0) {
    const err = new Error("Invalid order amount for VNPay.");
    err.status = 400;
    throw err;
  }

  const params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: currCode,
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: `Thanh toan don hang ${txnRef}`,
    vnp_OrderType: orderType,
    vnp_Amount: amountValue,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: process.env.VNPAY_DEFAULT_IP || "127.0.0.1",
    vnp_CreateDate: formatDate(createDate),
    vnp_ExpireDate: formatDate(expireDate),
  };

  const vnp_SecureHash = signParams(params);
  const payUrl = `${paymentUrl}?${buildQueryString({
    ...params,
    vnp_SecureHash: vnp_SecureHash,
  })}`;

  return {
    txnRef,
    payUrl,
  };
};

export const verifyVnpaySignature = (payload) => {
  const secureHash = payload.vnp_SecureHash;
  const params = { ...payload };

  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  return signParams(params) === secureHash;
};

const formatDate = (date) => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: process.env.VNPAY_TIMEZONE || "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
};
