import { googleAuthService, loginService, logoutService, refreshService, signupService } from "../services/authService.js"

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};



export const googleAuth = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } =
      await googleAuthService(req.body.credential);

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          provider: user.provider,
        },
      });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const { user, accessToken, refreshToken } =
      await loginService(identifier, password);

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json({
        user: {
          id: user._id.toString(),
          username: user.username,
          role: user.role,
        },
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  await logoutService(req.cookies.refreshToken);

  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json({ message: "Logged out successfully." });
};


export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const { user, accessToken, refreshToken } =
      await signupService(username, email, password);

    res
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .status(201)
      .json({
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          provider: user.provider,
        },
      });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const refresh = async (req, res) => {
  try {
    const { newAccessToken, newRefreshToken } =
      await refreshService(req.cookies.refreshToken);

    res
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json({ message: "Token rotated." });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
};

export const verifyMe = async (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    email: req.user.email
  });
}