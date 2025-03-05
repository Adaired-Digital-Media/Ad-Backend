import { Types } from "mongoose";

export type UserTypes = {
  image?: string;
  name: string;
  userName?: string;
  email: string;
  password?: string;
  contact?: string;
  isAdmin?: boolean;
  role?: Types.ObjectId;
  cart?: Types.ObjectId;
  wishlist?: { productId: Types.ObjectId; dateAdded: Date }[];
  status?: string;
  isVerifiedUser?: boolean;
  refreshToken?: string | null;
  googleId?: string;
  orderHistory?: {
    orderId: Types.ObjectId | null;
  }[],
};