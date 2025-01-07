import mongoose, { Schema } from "mongoose";
import { ProductTypes } from "../types/productTypes";

const ProductSchema = new Schema<ProductTypes>(
  {
    featuredImage: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    subCategory: [
      { type: Schema.Types.ObjectId, ref: "ProductCategory", required: true },
    ],
    minimumQuantity: { type: Number, default: 1 },
    minimumWords: { type: Number, default: null },
    slug: { type: String, unique: true },
    pricePerUnit: { type: Number, required: true },
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
    formId: { type: Schema.Types.ObjectId, ref: "Form" },
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalLink: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived", "Out of Stock"],
      default: "Active",
    },
    isFreeProduct: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category: 1 });

const Product = mongoose.model<ProductTypes>("Product", ProductSchema);

export default Product;
