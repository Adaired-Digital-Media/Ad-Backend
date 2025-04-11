import mongoose, { Schema, Types } from "mongoose";
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
    couponApplicableOn: {
      type: String,
      enum: ["allProducts", "specificProducts", "productCategories"],
      required: true,
    },
    couponType: {
      type: String,
      enum: ["all", "quantityBased"],
      required: true,
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value: number) {
          if (this.discountType === "percentage") {
            return value <= 100;
          }
          return true; 
        },
        message: "Discount value must be between 0 and 100 for percentage discounts",
      },
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
    specificProducts: {
      type: [{ type: Schema.Types.ObjectId, ref: "Product" }],
      default: [],
      validate: {
        validator: function (value: Types.ObjectId[]) {
          if (this.couponApplicableOn === "specificProducts") {
            return value && value.length > 0;
          }
          return value.length === 0;
        },
        message:
          "specificProducts is required for specificProducts applicability and must not be provided for others",
      },
    },
    productCategories: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      default: [],
      validate: {
        validator: function (value: Types.ObjectId[]) {
          if (this.couponApplicableOn === "productCategories") {
            return value && value.length > 0;
          }
          return value.length === 0;
        },
        message:
          "productCategories is required for productCategories applicability and must not be provided for others",
      },
    },
    minQuantity: {
      type: Number,
      default: 1,
      min: 1,
      validate: {
        validator: function (value: number) {
          if (this.couponType === "quantityBased") {
            return value >= 1;
          }
          return true;
        },
        message:
          "Minimum quantity must be greater or equal to 1 for quantityBased coupon type",
      },
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
    status: {
      type: String,
      default: "Active",
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
