import jwt from "jsonwebtoken";
import crypto from "crypto";
import RefreshToken from "../models/RefreshToken.js";

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const generateAccessToken = (user) =>
  jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

export const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

export const storeRefreshToken = async (userId, token) => {
  await RefreshToken.create({
    user: userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });
};