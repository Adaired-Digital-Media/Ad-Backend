import { Types } from "mongoose";

export interface CartProduct {
  _id?: Types.ObjectId;
  productId: Types.ObjectId;
  category: string;
  productName: string;
  productSlug: string;
  productImage: string;
  wordCount?: number;
  quantity: number;
  additionalInfo?: string;
  name?: string;
  email?: string;
  phone?: string;
  pricePerUnit: number;
  totalPrice: number;
  orderType: "OneTime" | "Monthly";
  isFreeProduct: boolean;
  addedAt: Date;
}

export interface CartTypes {
  userId: Types.ObjectId | string;
  products: CartProduct[];
  totalQuantity: number;
  totalPrice: number;
  status: "Unpaid" | "Pending" | "Completed" | "Canceled";
  createdAt?: Date;
  updatedAt?: Date;
}
