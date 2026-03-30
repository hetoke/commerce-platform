import { doubleCsrf } from "csrf-csrf";

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET,
  getSessionIdentifier: (req) => req.cookies?.accessToken ?? `${req.ip}:${req.headers['user-agent'] ?? ''}`,
  cookieName: "x-csrf-token",
  getCsrfTokenFromRequest: (req) => req.headers["x-csrf-token"],
  cookieOptions: {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

export { doubleCsrfProtection as csrfProtection, generateCsrfToken };