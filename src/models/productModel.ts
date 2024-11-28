import mongoose, { Schema } from "mongoose";
import { ProductTypes } from "../types/productTypes";

const ProductSchema = new Schema<ProductTypes>(
  {
    featuredImage: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    formId: { type: Schema.Types.ObjectId, ref: "Form" },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    subCategory: [
      { type: Schema.Types.ObjectId, ref: "Category", required: true },
    ],
    minimumQuantity: { type: Number, default: 1 },
    slug: { type: String, unique: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    pricingType: {
      type: String,
      enum: ["perWord", "perPost", "perReview", "perMonth", "oneTime"],
      default: "perWord",
    },
    stock: { type: Number, default: 0 },
    images: { type: [String] },
    tags: { type: [String] },
    priority: { type: Number, default: 0 },
    keywords: { type: [String] },
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalLink: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived", "Out of Stock"],
      default: "Active",
    },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });

const Product = mongoose.model<ProductTypes>("Product", ProductSchema);

export default Product;
