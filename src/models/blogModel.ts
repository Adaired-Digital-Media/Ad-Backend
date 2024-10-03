import mongoose, { Schema } from "mongoose";
import { BlogTypes } from "../types/blogTypes";

const blogSchema = new Schema(
  {
    metaTitle: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    canonicalLink: {
      type: String,
      required: true,
    },
    openGraphImage: {
      type: String,
      default: null,
    },
    robotsText: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },
    postDescription: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      default: null,
    },
    tags: {
      type: String,
      default: null,
    },
    blogAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["publish", "draft"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model<BlogTypes>("Blog", blogSchema);

export default Blog;
