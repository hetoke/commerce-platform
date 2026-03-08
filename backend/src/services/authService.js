import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  hashToken
} from "./tokenService.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthService = async (credential) => {
  if (!credential) {
    throw new Error("Google credential required");
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub } = payload;

  if (!email) {
    throw new Error("Google account has no email");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username: name.replace(/\s+/g, "").toLowerCase(),
      email,
      provider: "google",
      googleId: sub,
      role: "customer",
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const loginService = async (identifier, password) => {
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ]
  });

  if (!user) throw new Error("Invalid credentials.");
  if (user.provider !== "local")
    throw new Error("Please login using Google.");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials.");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const signupService = async (username, email, password) => {
  if (!username || !email || !password) {
    throw new Error("Username, email and password are required.");
  }

  username = username.trim().toLowerCase();
  email = email.trim().toLowerCase();

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new Error("Username already exists.");
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error("Email already registered.");
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    provider: "local",
    role: "customer",
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await storeRefreshToken(user._id, refreshToken);

  return { user, accessToken, refreshToken };
};

export const logoutService = async (refreshToken) => {
  if (!refreshToken) return;

  const hashed = hashToken(refreshToken);

  await RefreshToken.updateOne(
    { tokenHash: hashed },
    { revoked: true }
  );
};

export const refreshService = async (refreshToken) => {
  if (!refreshToken) {
    throw new Error("Missing refresh token.");
  }

  const hashed = hashToken(refreshToken);

  const stored = await RefreshToken.findOneAndUpdate(
    {
      tokenHash: hashed,
      revoked: false,
      expiresAt: { $gt: new Date() }
    },
    { revoked: true },
    { returnDocument: 'after' }
  ).populate("user");

  if (!stored) {
    const reused = await RefreshToken.findOne({ tokenHash: hashed });

    if (reused) {
      await RefreshToken.updateMany(
        { user: reused.user },
        { revoked: true }
      );
    }

    throw new Error("Invalid or reused refresh token.");
  }

  const newRefreshToken = generateRefreshToken(stored.user);
  const newAccessToken = generateAccessToken(stored.user);

  await storeRefreshToken(stored.user._id, newRefreshToken);

  return { newAccessToken, newRefreshToken };
};