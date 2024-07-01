import mongoose, { Schema } from "mongoose";
import { UserTypes } from "../types/userTypes";

const UserSchema = new Schema({
  name: { type: String, required: true },
  userName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  contact: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    default: "662f676a0072eaee25b546b8",
  },
  cart: {
    type: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Products" },
        quantity: { type: Number, default: 1 },
      },
    ],
    default: [],
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Orders",
    default: [],
  },
  userStatus: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model<UserTypes>("User", UserSchema);

export default User;
