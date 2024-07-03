import mongoose, { Schema } from "mongoose";
import { BlogCategoryTypes } from "../types/blogCategoryTypes";

const blogCategorySchema = new Schema(
  {
    parentCategory: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
    },
    subCategories: {
      type: [
        {
          categoryId: { type: Schema.Types.ObjectId, ref: "BlogCategory" },
        },
      ],
      default: [],
    },
    categoryName: {
      type: String,
      required: true,
    },
    categorySlug: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    blogs: {
      type: [
        {
          blogId: { type: Schema.Types.ObjectId, ref: "Blog" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const BlogCategory = mongoose.model<BlogCategoryTypes>(
  "BlogCategory",
  blogCategorySchema
);

export default BlogCategory;
