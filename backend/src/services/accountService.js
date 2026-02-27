import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const updateUsernameService = async (userId, newUsername) => {
  if (!newUsername) {
    throw new Error("New username required");
  }

  const normalized = newUsername.trim().toLowerCase();

  const existingUser = await User.findOne({
    username: normalized,
    _id: { $ne: userId },
  });

  if (existingUser) {
    throw new Error("Username already taken");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { username: normalized },
    { new: true, runValidators: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

export const getProfileService = async (userId) => {
  const user = await User.findById(userId).select("-password");

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};




export const changePasswordService = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (user.provider !== "local") {
    throw new Error("Password change not available for OAuth accounts");
  }

  if (!user.password) {
    throw new Error("No password set for this account");
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);

  if (!isValid) {
    throw new Error("Current password incorrect");
  }

  const isSame = await bcrypt.compare(newPassword, user.password);

  if (isSame) {
    throw new Error("New password must be different");
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return true;
};