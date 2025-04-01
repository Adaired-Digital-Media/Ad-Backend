import { Types } from "mongoose";
import Coupon from "../models/coupon.model";
import { CustomError } from "../middlewares/error";
import checkPermission from "../helpers/authHelper";
import { validateInput } from "../utils/validateInput";
import { NextFunction, Request, Response } from "express";

// Helper function to calculate discount.
export const calculateDiscount = (
  coupon: any,
  cartData: { products: any[]; totalPrice: number; totalQuantity: number }
): { discount: number; discountedTotal: number } => {
  let discount = 0;
  let discountedTotal = cartData.totalPrice;

  switch (coupon.discountType) {
    case "PERCENTAGE":
      if (cartData.totalPrice < (coupon.minOrderAmount || 0)) {
        throw new CustomError(400, "Minimum order amount not met");
      }
      discount = (cartData.totalPrice * coupon.discountValue) / 100;
      discount = Math.min(discount, coupon.maxDiscountAmount || Infinity);
      break;

    case "FLAT":
      if (cartData.totalPrice < (coupon.minOrderAmount || 0)) {
        throw new CustomError(400, "Minimum order amount not met");
      }
      discount = coupon.discountValue;
      break;

    case "PRODUCT_SPECIFIC":
      const specificProduct = cartData.products.find(
        (p) => p.product._id.toString() === coupon.specificProduct?.toString()
      );
      if (!specificProduct) {
        throw new CustomError(400, "Specific product not found in cart");
      }
      discount = specificProduct.totalPrice * (coupon.discountValue / 100);
      break;

    case "QUANTITY_BASED":
      const hasEnoughQuantity = cartData.products.some(
        (p) => p.quantity >= (coupon.minQuantity || 1)
      );
      if (!hasEnoughQuantity) {
        throw new CustomError(400, "Minimum quantity requirement not met");
      }
      discount = (cartData.totalPrice * coupon.discountValue) / 100;
      discount = Math.min(discount, coupon.maxDiscountAmount || Infinity);
      break;

    default:
      throw new CustomError(400, "Invalid discount type");
  }
  discountedTotal = Math.max(0, cartData.totalPrice - discount);
  return { discount, discountedTotal };
};

// Helper to validate and apply coupon
export const applyCoupon = async (
  couponCode: string | undefined,
  cart: any,
  userId: string
): Promise<{ coupon: any; discountUSD: number; finalPriceUSD: number }> => {
  let discountUSD = 0;
  let finalPriceUSD = cart.totalPrice;
  let coupon = null;

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    });

    if (!coupon) {
      throw new CustomError(404, "Invalid or expired coupon");
    }

    const userUsage = coupon.userUsage?.find(
      (u: any) => u.userId.toString() === userId
    );
    if (userUsage && userUsage.usageCount >= coupon.usageLimitPerUser) {
      throw new CustomError(400, "Coupon usage limit reached for this user");
    }
    if (coupon.usedCount >= coupon.totalUsageLimit) {
      throw new CustomError(400, "Coupon total usage limit reached");
    }

    const cartDataUSD = {
      products: cart.products,
      totalPrice: cart.totalPrice,
      totalQuantity: cart.totalQuantity,
    };

    const { discount, discountedTotal } = calculateDiscount(
      coupon,
      cartDataUSD
    );
    discountUSD = discount;
    finalPriceUSD = discountedTotal;

    if (userUsage) {
      userUsage.usageCount += 1;
    } else {
      coupon.userUsage = coupon.userUsage || [];
      coupon.userUsage.push({
        userId: new Types.ObjectId(userId),
        usageCount: 1,
      });
    }
    coupon.usedCount += 1;
    await coupon.save();
  }

  return { coupon, discountUSD, finalPriceUSD };
};

// *********************************************************
// ******************* Create New Coupon *******************
// *********************************************************
export const createCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "coupons", 0);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    // Validate user input
    if (!validateInput(req, res)) return;

    // Add createdBy field
    const newCoupon = new Coupon({
      ...body,
      createdBy: userId,
      updatedBy: userId,
    });

    await newCoupon.save();
    res.status(201).json({
      message: "Coupon created successfully",
      data: newCoupon,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// *********************************************************
// ******************* Apply Coupon ***********************
// *********************************************************
export const calculateCouponDiscount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, localCart } = req.body;

    if (!localCart || !localCart.products || localCart.products.length === 0) {
      return next(new CustomError(400, "Cart cannot be empty"));
    }

    const cartData = localCart;

    if (!code) {
      return res.status(200).json({
        message: "No coupon applied",
        originalTotal: cartData.totalPrice,
        couponDiscount: 0,
        finalPrice: cartData.totalPrice,
      });
    }

    const coupon = await Coupon.findOne({
      code: code,
      isActive: true,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    });

    if (!coupon) {
      return next(new CustomError(404, "Invalid or expired coupon"));
    }

    const { discount, discountedTotal } = calculateDiscount(coupon, cartData);

    res.status(200).json({
      message: "Coupon discount calculated successfully",
      originalTotal: cartData.totalPrice,
      couponDiscount: discount,
      finalPrice: discountedTotal,
    });
  } catch (error) {
    next(
      new CustomError(
        500,
        error instanceof Error ? error.message : "An error occurred"
      )
    );
  }
};

// *********************************************************
// ******************* Update Coupon ***********************
// *********************************************************
export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, params, body } = req;
    const { couponId } = params;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "coupons", 2);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    // Find and update the coupon
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { ...body, updatedBy: userId },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      throw new CustomError(404, "Coupon not found");
    }

    res.status(200).json({
      message: "Coupon updated successfully",
      data: updatedCoupon,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};
