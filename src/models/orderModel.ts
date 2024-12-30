import mongoose, { Schema, Document } from "mongoose";
import { OrderTypes } from "../types/orderTypes";

// Create the Order schema
const OrderSchema = new Schema<OrderTypes>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        category: { type: String, required: true },
        productName: { type: String, required: true },
        productImage: { type: String, required: true },
        wordCount: { type: Number, min: 100 },
        quantity: { type: Number, required: true, min: 1 },
        name: { type: String },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        additionalInfo: { type: String },
        orderType: {
          type: String,
          enum: ["OneTime", "Monthly"],
          default: "OneTime",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalQuantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    discountedPrice: { type: Number, required: true },
    couponId: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    couponDiscount: { type: Number, default: 0 },
    paymentId: { type: String, required: true },
    invoiceId: { type: String, required: true },
    paymentUrl: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Confirmed",
        "Cancelled",
        "Completed",
        "Failed",
      ],
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
    zohoInvoiceId: { type: String },
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
