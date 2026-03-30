import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id?: string;
      _id?: unknown;
      username?: string;
      email?: string;
      role?: string;
      provider?: string;
      [key: string]: unknown;
    };
  }
}
