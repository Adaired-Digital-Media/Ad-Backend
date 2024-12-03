import mongoose, { Schema } from "mongoose";
import { CategoryTypes } from "../types/productTypes";

const CategorySchema = new Schema<CategoryTypes>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    children: { type: [Schema.Types.ObjectId], default: [] },
    products: { type: [Schema.Types.ObjectId], default: [] },
    slug: { type: String },
    image: { type: String },
    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalLink: { type: String },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Archived"],
      default: "Active",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });

const ProductCategory = mongoose.model<CategoryTypes>(
  "ProductCategory",
  CategorySchema
);

export default ProductCategory;
