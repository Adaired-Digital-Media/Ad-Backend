import { Types } from "mongoose";
export type UserTypes = {
  image?: string;
  name: string;
  userName?: string;
  email: string;
  password: string;
  contact: string;
  isAdmin: boolean;
  role: Types.ObjectId;
  cart?: Types.ObjectId;
  wishlist?: { productId: string; dateAdded: Date }[];
  userStatus: boolean;
  refreshToken?: string;
  googleId?: string;
  appleId?: string;
  orderHistory?: {
    orderId: string;
    status: "Pending" | "Shipped" | "Delivered" | "Canceled";
    dateOrdered: Date;
    items: { productId: string; quantity: number; price: number }[];
    totalAmount: number;
  }[];
};
