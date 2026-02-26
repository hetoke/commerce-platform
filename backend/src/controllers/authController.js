import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import crypto from "crypto";

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

export const login = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const accessToken = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      },
    });
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const hashed = hashToken(token);

    await RefreshToken.updateOne(
      { tokenHash: hashed },
      { revoked: true }
    );
  }

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({ message: "Logged out successfully." });
};


export const signup = async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required." });
  }

  const existing = await User.findOne({ username });
  if (existing) {
    return res.status(409).json({ message: "Username already exists." });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    password: hashed,
    role: "customer",
  });

  const accessToken = jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  res
    .cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .status(201)
    .json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
      },
    });
};


export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Missing refresh token." });
  }

  const hashed = hashToken(token);

  const stored = await RefreshToken.findOneAndUpdate(
    {
      tokenHash: hashed,
      revoked: false,
      expiresAt: { $gt: new Date() }
    },
    {
      $set: { revoked: true }
    },
    { new: true }
  ).populate("user");

  if (!stored) {
    // Check if token existed but was already revoked (reuse detection)
    const reused = await RefreshToken.findOne({ tokenHash: hashed });

    if (reused) {
      // 🚨 Reuse detected — revoke all sessions
      await RefreshToken.updateMany(
        { user: reused.user },
        { revoked: true }
      );
    }

    return res.status(403).json({
      message: "Invalid or reused refresh token."
    });
  }

  const newRefreshToken = jwt.sign(
    { id: stored.user._id.toString() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  await RefreshToken.create({
    user: stored.user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  const newAccessToken = jwt.sign(
    { id: stored.user._id.toString(), role: stored.user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  res
    .cookie("accessToken", newAccessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json({ message: "Token rotated." });
};

export const verifyMe = async (req, res) => {
  //console.log(req.user.role);
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  });
}