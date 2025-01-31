import mongoose, { Schema, Document } from "mongoose";
import { OrderTypes } from "../types/orderTypes";

// Create the Order schema
const OrderSchema = new Schema<OrderTypes>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        wordCount: { type: Number, min: 100 },
        quantity: { type: Number, required: true, min: 1 },
        additionalInfo: { type: String },
        totalPrice: { type: Number, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponDiscount: { type: Number, default: 0 },
    paymentId: { type: String },
    invoiceId: { type: String, required: true },
    zohoInvoiceId: { type: String },
    paymentUrl: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Unpaid", "Paid", "Refunded", "Failed"],
      default: "Unpaid",
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "Stripe"],
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
