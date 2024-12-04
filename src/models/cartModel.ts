import mongoose, { Schema } from "mongoose";
import { CartTypes } from "../types/cartTypes";

const CartSchema = new Schema<CartTypes>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true, min: 1 },
        wordCount: { type: Number, min: 100 },
        pricePerUnit: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        productType: {
          type: String,
          enum: ["OneTime", "Monthly"],
          default: "OneTime",
        },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    totalQuantity: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Unpaid", "Pending", "Completed", "Canceled"],
      default: "Unpaid",
    },
  },
  { timestamps: true }
);

CartSchema.index({ userId: 1 });

const Cart = mongoose.model<CartTypes>("Cart", CartSchema);

export default Cart;
