import mongoose, { Schema, Document } from "mongoose";
import { OrderTypes } from "../types/orderTypes";

// Create the Order schema
const OrderSchema = new Schema<OrderTypes>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        wordsCount: { type: Number, min: 100 },
        quantity: { type: Number, required: true, min: 1 },
        pricePerUnit: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        additionalInfo: { type: String },
        orderType: {
          type: String,
          enum: ["OneTime", "Monthly"],
          required: true,
        },
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponDiscount: { type: Number, default: 0 },
    paymentId: { type: String, required: true },
    invoiceId: { type: String, required: true },
    zohoInvoiceId: { type: String, required: true },
    paymentUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Canceled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["CreditCard", "PayPal", "BankTransfer", "Other"],
      required: true,
    },
    paymentDate: { type: Date },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({
  userId: 1,
  status: 1,
  paymentStatus: 1,
  paymentId: 1,
  invoiceId: 1,
  zohoInvoiceId: 1,
  paymentMethod: 1,
});

const Order = mongoose.model<OrderTypes>("Order", OrderSchema);

export default Order;
