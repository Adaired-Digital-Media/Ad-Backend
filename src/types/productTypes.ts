import { Types } from "mongoose";

export type ProductTypes = {
  featuredImage: string;
  name: string;
  description: string;
  userId: Types.ObjectId;
  formId: Types.ObjectId;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  minimumQuantity?: number;
  slug: string;
  price: number;
  quantity: number;
  pricingType: "perWord" | "perPost" | "perReview" | "perMonth" | "oneTime";
  stock: number;
  images: string[];
  tags?: string[];
  priority?: number;
  keywords?: string[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalLink?: string;
  status: "Active" | "Inactive" | "Archived" | "Out of Stock";
  isFeatured: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface CategoryTypes {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  parentCategory?: Types.ObjectId;
  children?: Types.ObjectId[];
  products?: Types.ObjectId[];
  slug: string;
  image?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalLink?: string;
  status: "Active" | "Inactive" | "Archived";
  createdAt?: Date;
  updatedAt?: Date;
}
