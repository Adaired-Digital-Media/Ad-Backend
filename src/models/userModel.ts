import mongoose, { Schema } from "mongoose";
import { UserTypes } from "../types/userTypes";

const UserSchema = new Schema<UserTypes>(
  {
    image: { type: String },
    name: {
      type: String,
      required: true,
      trim: true
    },
    userName: { type: String },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: { type: String },
    contact: { type: String },
    isAdmin: { type: Boolean, default: false },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      default: new mongoose.Types.ObjectId("662f676a0072eaee25b546b8")
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    appleId: {
      type: String,
      unique: true,
      sparse: true
    },
    orderHistory: [
      { orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null } }
    ],
    cart: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      default: new mongoose.Types.ObjectId("662f676a0072eaee25b546b8")
    },
    wishlist: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          dateAdded: { type: Date, default: Date.now }
        }
      ],
      default: []
    },
    userStatus: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

const User = mongoose.model<UserTypes>("User", UserSchema);

export default User;
