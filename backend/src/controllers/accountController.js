// controllers/accountController.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * Update username
 * PUT /api/account/update-username
 */
export const updateUsername = async (req, res) => {
  try {
    const { newUsername } = req.body;
    const userId = req.user.id;

    if (!newUsername) {
      return res.status(400).json({ message: "New username required" });
    }

    // Check if username exists (case-insensitive)
    const existingUser = await User.findOne({
      username: { $regex: new RegExp(`^${newUsername}$`, "i") },
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username: newUsername },
      { new: true, runValidators: true }
    );

    return res.json({
      message: "Username updated successfully",
      user: {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error." });
  }
};


/**
 * Change password
 * PUT /api/account/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "New password must be different",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password changed successfully" });

  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};


/**
 * Get user profile
 * GET /api/account/profile
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};