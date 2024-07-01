import mongoose, { Schema } from "mongoose";
import { BlogTypes } from "../types/blogTypes";

const blogSchema = new Schema(
  {
    blogMetaTitle: {
      type: String,
      required: true,
    },
    blogMetaDescription: {
      type: String,
      required: true,
    },
    blogOGImage: {
      type: String,
      required: true,
    },
    blogCategory: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
    },
    blogImage: {
      type: String,
      required: true,
    },
    blogImageAlt: {
      type: String,
      required: true,
    },
    blogTitle: {
      type: String,
      required: true,
    },
    blogContent: {
      type: String,
      required: true,
    },
    blogTags: {
      type: [String],
      default: [],
    },
    blogSlug: {
      type: String,
      required: true,
    },
    blogAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model<BlogTypes>("Blog", blogSchema);

export default Blog;
