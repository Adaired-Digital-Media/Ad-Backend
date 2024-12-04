import { Types } from "mongoose";

export interface CartProduct {
  productId: Types.ObjectId;
  quantity: number;
  wordCount?: number;
  pricePerUnit: number;
  totalPrice: number;
  productType: "OneTime" | "Monthly";
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
