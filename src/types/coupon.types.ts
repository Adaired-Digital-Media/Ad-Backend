// types/couponTypes.ts
import { Types } from "mongoose";

export interface CouponTypes {
  _id?: Types.ObjectId;
  code: string;
  discountType: "PERCENTAGE" | "FLAT" | "PRODUCT_SPECIFIC" | "QUANTITY_BASED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  specificProduct?: Types.ObjectId;
  minQuantity?: number;
  usageLimitPerUser?: number;
  totalUsageLimit?: number;
  usedCount?: number;
  userUsage?: {
    userId: Types.ObjectId;
    usageCount: number;
  }[];
  isActive?: boolean;
  expiresAt?: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}