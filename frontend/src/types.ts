import type { Dispatch, SetStateAction } from "react";

export interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role?: "admin" | "customer" | string;
}

export interface Item {
  id: string;
  _id?: string;
  name: string;
  price: number | string;
  location: string;
  description: string;
  detailedDescription?: string;
  path?: string;
  image?: string;
  imagePath?: string;
  averageRating?: number;
  reviewCount?: number;
  sellCount?: number;
}

export interface PurchaseItem {
  id: string;
  itemId?: string;
  name: string;
  location: string;
  price: number;
  quantity: number;
  purchasedAt: string;
}

export interface OrderCustomerInfo {
  name: string;
  phoneNumber: string;
  receivedLocation: string;
  paymentMethod: string;
}

export interface Order {
  id: string;
  items: PurchaseItem[];
  totalQuantity: number;
  totalPrice: number;
  createdAt: string;
  customerInfo: OrderCustomerInfo;
  status?: "pending" | "confirmed" | "shipping" | "delivered" | "cancelled";
}

export interface Review {
  _id: string;
  rating: number;
  comment: string;
  user?: Pick<User, "username"> | null;
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastPayload {
  message: string;
  type: ToastType;
}

export interface AuthContextValue {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  authLoading: boolean;
}
