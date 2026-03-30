// @ts-nocheck
import { updateUsernameService, changePasswordService, getProfileService } from "../services/accountService.ts";

/**
 * Update username
 * PUT /api/account/update-username
 */
export const updateUsername = async (req, res) => {
  try {
    const user = await updateUsernameService(
      req.user.id,
      req.body.newUsername
    );

    return res.json({
      message: "Username updated successfully",
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};


/**
 * Change password
 * PUT /api/account/change-password
 */
export const changePassword = async (req, res) => {
  try {
    await changePasswordService(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );

    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

/**
 * Get user profile
 * GET /api/account/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await getProfileService(req.user.id);

    return res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};
