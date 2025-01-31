import Product from "../models/productModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import slugify from "slugify";
import checkPermission from "../helpers/authHelper";
import { ProductTypes } from "../types/productTypes";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import ProductCategory from "../models/productCategoryModel";

// Helper function to validate user input
const validateInput = (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      message: "Invalid input",
      errors: errors.array(),
    });
    return false;
  }
  return true;
};

// Helper function to check if a slug is unique
const isSlugUnique = async (slug: string) => {
  const existingProduct = await Product.findOne({ slug });
  return !existingProduct;
};

// Helper function to fetch product by ID or slug
const fetchProduct = async (identifier: string) => {
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    return await Product.findById(identifier);
  } else {
    return await Product.findOne({ slug: identifier });
  }
};

// Helper function to update product in categories
const updateProductInCategories = async (
  productId: Types.ObjectId,
  oldCategoryId: Types.ObjectId | null,
  oldSubCategoryId: Types.ObjectId | null,
  newCategoryId: Types.ObjectId | null,
  newSubCategoryId: Types.ObjectId | null
) => {
  const updates = [];
  if (oldCategoryId) {
    updates.push(
      ProductCategory.updateOne(
        { _id: oldCategoryId },
        { $pull: { products: productId } }
      )
    );
  }
  if (oldSubCategoryId) {
    updates.push(
      ProductCategory.updateOne(
        { _id: oldSubCategoryId },
        { $pull: { products: productId } }
      )
    );
  }
  if (newCategoryId) {
    updates.push(
      ProductCategory.updateOne(
        { _id: newCategoryId },
        { $push: { products: productId } }
      )
    );
  }
  if (newSubCategoryId) {
    updates.push(
      ProductCategory.updateOne(
        { _id: newSubCategoryId },
        { $push: { products: productId } }
      )
    );
  }
  await Promise.all(updates);
};

// ***************************************
// ********** Create Product **************
// ***************************************
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 0);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    // Validate user input
    if (!validateInput(req, res)) return;

    const { slug, name, subCategory } = body;

    // If slug is not provided, use the product name to create the slug
    const slugToUse = slug
      ? slugify(slug, { lower: true })
      : slugify(name, { lower: true });

    // Check if the slug is unique
    if (!(await isSlugUnique(slugToUse))) {
      throw new CustomError(400, "Slug already in use");
    }

    // If subCategory is provided, fetch it and the parent category
    let parentCategory = null;
    if (subCategory) {
      const subcategory = await ProductCategory.findById(subCategory);
      if (!subcategory) {
        throw new CustomError(404, "Subcategory not found");
      }
      parentCategory = await ProductCategory.findById(
        subcategory.parentCategory
      );
      if (!parentCategory) {
        throw new CustomError(404, "Parent category not found");
      }
    }

    // Create the product with the parent category assigned
    const newProduct: ProductTypes = {
      ...body,
      category: parentCategory ? parentCategory._id : null,
      slug: slugToUse,
      createdBy: body.userId || userId,
    };
    const createdProduct = await Product.create(newProduct);

    // Update categories
    if (subCategory && parentCategory) {
      await updateProductInCategories(
        createdProduct._id,
        null,
        null,
        parentCategory._id,
        subCategory
      );
    }

    res
      .status(201)
      .json({ message: "Product created successfully", data: createdProduct });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Read Product ****************
// ***************************************
export const readProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { query } = req.query;

  try {
    let product;

    if (query) {
      const idString = query.toString();
      product = await fetchProduct(idString);
      if (!product) {
        throw new CustomError(404, "Product not found!");
      }
      return res.status(200).json({
        message: "Product found",
        data: product,
      });
    } else {
      const products = await Product.find()
        .populate("createdBy category subCategory")
        .lean();
      return res.status(200).json({
        message: "All products",
        data: products,
      });
    }
  } catch (error: any) {
    return next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Update Product **************
// ***************************************
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { query } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 2);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    // Validate user input
    if (!validateInput(req, res)) return;

    const idString = query.toString();
    const product = await fetchProduct(idString);
    if (!product) {
      throw new CustomError(404, "Product not found!");
    }

    // Check if the slug is being updated and validate uniqueness
    if (body.slug && body.slug !== product.slug) {
      const slugToUse = slugify(body.slug, { lower: true });
      if (!(await isSlugUnique(slugToUse))) {
        throw new CustomError(400, "Slug already in use");
      }
      body.slug = slugToUse;
    }

    // If subCategory is provided, fetch it and the parent category
    let parentCategory = null;
    let newSubCategoryId = null;
    if (
      body.subCategory &&
      body.subCategory !== product.subCategory?.toString()
    ) {
      const newSubcategory = await ProductCategory.findById(body.subCategory);
      if (!newSubcategory) {
        throw new CustomError(404, "Subcategory not found");
      }
      parentCategory = await ProductCategory.findById(
        newSubcategory.parentCategory
      );
      if (!parentCategory) {
        throw new CustomError(404, "Parent category not found");
      }
      newSubCategoryId = newSubcategory._id;
    }

    // Update product in categories if subCategory is changing
    if (newSubCategoryId) {
      await updateProductInCategories(
        product._id,
        product.category,
        product.subCategory,
        parentCategory?._id || null,
        newSubCategoryId
      );
      body.category = parentCategory?._id || null;
    }

    // Update the product
    body.updatedBy = userId;
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: body },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Delete Product **************
// ***************************************
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { query } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 3);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    const idString = query.toString();
    const product = await fetchProduct(idString);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove product from categories
    await updateProductInCategories(
      product._id,
      product.category,
      product.subCategory,
      null,
      null
    );

    // Delete the product
    await Product.findByIdAndDelete(product._id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Duplicate Product ***********
// ***************************************
export const duplicateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { query } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 0);
    if (!permissionCheck) {
      throw new CustomError(403, "Permission denied");
    }

    const idString = query.toString();
    const product = await fetchProduct(idString);
    if (!product) {
      throw new CustomError(404, "Product not found");
    }

    // Prepare the duplicated product data
    const duplicatedProductData = {
      ...product.toObject(),
      _id: new Types.ObjectId(),
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create the duplicated product
    const duplicatedProduct = await Product.create(duplicatedProductData);

    // Add duplicated product to categories
    await updateProductInCategories(
      duplicatedProduct._id,
      null,
      null,
      product.category,
      product.subCategory
    );

    res.status(201).json({
      message: "Product duplicated successfully",
      data: duplicatedProduct,
    });
  } catch (error: any) {
    next(new CustomError(500, error.message));
  }
};
