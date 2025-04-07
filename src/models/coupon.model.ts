
import mongoose, { Schema } from "mongoose";
import { CouponTypes } from "../types/coupon.types";

const CouponSchema = new Schema<CouponTypes>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["PERCENTAGE", "FLAT", "PRODUCT_SPECIFIC", "QUANTITY_BASED"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscountAmount: {
      type: Number,
      default: Infinity,
    },
    specificProduct: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    minQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxQuantity: {
      type: Number,
      default: null,
      min: 1,
    },
    maxWordCount: {
      type: Number,
      default: null,
      min: 1,
    },
    usageLimitPerUser: {
      type: Number,
      default: Infinity,
    },
    totalUsageLimit: {
      type: Number,
      default: Infinity,
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    userUsage: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        usageCount: { type: Number, default: 0 },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);
CouponSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model<CouponTypes>("Coupon", CouponSchema);
export default Coupon;
