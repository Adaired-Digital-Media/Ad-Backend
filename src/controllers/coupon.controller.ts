import { Types } from "mongoose";
import Cart from "../models/cartModel";
import Coupon from "../models/coupon.model";
import { CustomError } from "../middlewares/error";
import checkPermission from "../helpers/authHelper";
import { validateInput } from "../utils/validateInput";
import { NextFunction, Request, Response } from "express";

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
