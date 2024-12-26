import { Types } from "mongoose";

export interface CartProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  productName: string;
  productImage: string;
  quantity: number;
  wordCount?: number;
  userName?: string;
  email?: string;
  phone?: string;
  pricePerUnit: number;
  totalPrice: number;
  additionalInfo?: string;
  orderType: "OneTime" | "Monthly";
  addedAt: Date;
}

export interface CartTypes {
  userId: Types.ObjectId;
  products: CartProduct[];
  totalQuantity: number;
  totalPrice: number;
  status: "Unpaid" | "Pending" | "Completed" | "Canceled";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JunkCartTypes {
  userId: string;
  products: CartProduct[];
  totalQuantity: number;
  totalPrice: number;
  status: "Unpaid" | "Pending" | "Completed" | "Canceled";
  createdAt?: Date;
  updatedAt?: Date;
}
