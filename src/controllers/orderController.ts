import Order from "../models/orderModel";
import checkPermission from "../helpers/authHelper";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { createPaymentIntent } from "../helpers/stripeHelper";

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    
};
