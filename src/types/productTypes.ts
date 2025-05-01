import mongoose, { Types, Schema, Document, Model } from "mongoose";

export type ProductTypes = {
  _id: Types.ObjectId;
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

export interface Option {
  value: string;
  name: string;
}

export interface Field {
  name: string;
  label: string;
  inputType: string;
  inputMinLength?: number | null;
  inputMaxLength?: number | null;
  inputPlaceholder?: string | null;
  inputValidationPattern?: string | null;
  inputRequired: boolean;
  customClassName?: string | null;
  multipleOptions?: Option[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FormField {
  field: Types.ObjectId;
  fieldOrder: number;
}

export interface Form {
  productType: string;
  title: string;
  fields: FormField[];
  status: "Active" | "Inactive";
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  createdAt?: Date;
  updatedAt?: Date;
}