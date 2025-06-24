import mongoose from "mongoose";
import { SEO } from "./seo-schema.types";

export interface BlogTypes extends Document {
  category?: mongoose.Types.ObjectId | null;
  featuredImage: string;
  postTitle: string;
  postDescription: string;
  slug: string | null;
  tags: string[];
  seo: SEO;
  blogAuthor?: mongoose.Types.ObjectId | null;
  updatedBy?: mongoose.Types.ObjectId | null;
  status: "publish" | "draft";
  createdAt?: Date;
  updatedAt?: Date;
}
