import { Types } from "mongoose";

export interface CartProduct {
  productId: Types.ObjectId;
  productName: string;
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
