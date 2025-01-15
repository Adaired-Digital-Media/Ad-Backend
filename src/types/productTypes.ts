import mongoose, { Types, Schema, Document, Model } from "mongoose";

export type ProductTypes = {
  featuredImage: string;
  name: string;
  description: string;
  category: Types.ObjectId;
  subCategory: Types.ObjectId;
  minimumWords?: number;
  minimumQuantity?: number;
  slug: string;
  pricePerUnit: number;
  pricingType: "perWord" | "perPost" | "perReview" | "perMonth" | "perQuantity";
  stock: number;
  images: string[];
  tags?: string[];
  priority?: number;
  keywords?: string[];
  formId?: Types.ObjectId;
  metaTitle?: string;
  metaDescription?: string;
  canonicalLink?: string;
  status: "Active" | "Inactive" | "Archived" | "Out of Stock";
  isFreeProduct: boolean;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface CategoryTypes {
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
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormField {
  name: string;
  label: string;
  placeholder: string;
  type: "text" | "number" | "textarea" | "checkbox" | "radio" | "select";
  options?: { label: string; value: string }[];
  required: boolean;
}

export interface Form extends Document {
  productType: string;
  fields: FormField[];
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
}
