import csurf from "csurf";

export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",           // only HTTPS in prod
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // localhost uses Lax
  },
});