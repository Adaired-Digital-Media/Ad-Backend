import { Types } from "mongoose";
import Coupon from "../models/coupon.model";
import { CustomError } from "../middlewares/error";
import { checkPermission } from "../helpers/authHelper";
import { validateInput } from "../utils/validateInput";
import { NextFunction, Request, Response } from "express";

// Helper function to calculate discount.
export const calculateDiscount = (
  coupon: any,
  cartData: {
    products: {
      product: Types.ObjectId;
      quantity: number;
      wordCount: number;
      totalPrice: number;
      [key: string]: any;
    }[];
    totalPrice: number;
    totalQuantity: number;
  }
): {
  discount: number;
  discountedTotal: number;
  appliedTo?: Types.ObjectId;
} => {
  let discount = 0;
  let discountedTotal = cartData.totalPrice;
  let appliedTo: Types.ObjectId | undefined = undefined;

  // Special handling for 100% off coupons
  if (coupon.discountValue === 100 && coupon.discountType === "PERCENTAGE") {
    // Find all qualifying products (meet word count if specified)
    const qualifyingProducts = cartData.products.filter(
      (product) =>
        !coupon.maxWordCount || product.wordCount <= coupon.maxWordCount
    );

    if (qualifyingProducts.length === 0) {
      throw new CustomError(
        400,
        coupon.maxWordCount
          ? `Coupon "${coupon.code}" requires items with ≤ ${coupon.maxWordCount} words`
          : `No items qualify for coupon "${coupon.code}"`
      );
    }

    // Find the lowest priced qualifying product
    const productToDiscount = qualifyingProducts.reduce((lowest, current) =>
      current.totalPrice < lowest.totalPrice ? current : lowest
    );

    // Validate quantity is 1
    if (productToDiscount.quantity !== 1) {
      throw new CustomError(
        400,

        `"${coupon.code}" applies to single-item purchases only. 
Please remove other items and set quantity to 1 to enjoy this discount.`
      );
    }

    // Apply 100% discount to this product
    discount = productToDiscount.totalPrice;
    discountedTotal = cartData.totalPrice - discount;
    appliedTo = productToDiscount.product;

    return { discount, discountedTotal, appliedTo };
  }

  // Existing logic for other coupon types
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
        throw new CustomError(
          400,
          `Product required for coupon "${coupon.code}" not found`
        );
      }
      discount = specificProduct.totalPrice * (coupon.discountValue / 100);
      appliedTo = specificProduct.product;
      break;

    case "QUANTITY_BASED":
      const hasEnoughQuantity = cartData.products.some(
        (p) => p.quantity >= (coupon.minQuantity || 1)
      );
      if (!hasEnoughQuantity) {
        throw new CustomError(
          400,
          `Minimum quantity of ${coupon.minQuantity} required for coupon "${coupon.code}"`
        );
      }
      discount = (cartData.totalPrice * coupon.discountValue) / 100;
      discount = Math.min(discount, coupon.maxDiscountAmount || Infinity);
      break;

    default:
      throw new CustomError(400, "Invalid discount type");
  }

  discountedTotal = Math.max(0, cartData.totalPrice - discount);
  return { discount, discountedTotal, appliedTo };
};

// Helper to validate and apply coupon
export const applyCoupon = async (
  couponCode: string | undefined,
  cart: any,
  userId: string
): Promise<{
  coupon: any;
  discountUSD: number;
  finalPriceUSD: number;
  appliedTo?: Types.ObjectId;
  message?: string;
}> => {
  let discountUSD = 0;
  let finalPriceUSD = cart.totalPrice;
  let coupon = null;
  let appliedTo: Types.ObjectId | undefined = undefined;
  let message = "Coupon applied successfully";

  if (couponCode) {
    coupon = await Coupon.findOne({
      code: couponCode,
      isActive: true,
      $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
    });

    if (!coupon) {
      throw new CustomError(404, "Invalid or expired coupon");
    }

    // Check usage limits
    const userUsage = coupon.userUsage?.find(
      (u: any) => u.userId.toString() === userId
    );
    if (userUsage && userUsage.usageCount >= coupon.usageLimitPerUser) {
      throw new CustomError(
        400,
        `You've reached the usage limit for coupon "${coupon.code}"`
      );
    }
    if (coupon.usedCount >= coupon.totalUsageLimit) {
      throw new CustomError(
        400,
        `Coupon "${coupon.code}" has reached its total usage limit`
      );
    }

    const {
      discount,
      discountedTotal,
      appliedTo: productId,
    } = calculateDiscount(coupon, {
      products: cart.products,
      totalPrice: cart.totalPrice,
      totalQuantity: cart.totalQuantity,
    });

    discountUSD = discount;
    finalPriceUSD = discountedTotal;
    appliedTo = productId;

    // Custom message for 100% off coupon
    if (coupon.discountValue === 100 && coupon.discountType === "PERCENTAGE") {
      const product = cart.products.find((p: any) =>
        p.product.equals(productId)
      );
      message = `100% discount applied to "${
        product?.product?.name || "your item"
      }" (max ${coupon.maxWordCount} words)`;
    }

    // Update coupon usage
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

  return { coupon, discountUSD, finalPriceUSD, appliedTo, message };
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
        appliedTo: null,
        productDiscounts: {},
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

    const { discount, discountedTotal, appliedTo } = calculateDiscount(
      coupon,
      cartData
    );

    const productDiscounts: { [key: string]: number } = {};
    if (appliedTo) {
      const targetedProduct = cartData.products.find(
        (p: any) => p.product.toString() === appliedTo.toString()
      );
      productDiscounts[appliedTo._id.toString()] = targetedProduct.totalPrice;
    } else {
      cartData.products.forEach((product: any) => {
        productDiscounts[product.product._id.toString()] = 0;
      });
    }
    res.status(200).json({
      message: "Coupon discount calculated successfully",
      originalTotal: cartData.totalPrice,
      couponDiscount: discount,
      finalPrice: discountedTotal,
      appliedTo: appliedTo?._id?.toString() || null,
      productDiscounts,
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
