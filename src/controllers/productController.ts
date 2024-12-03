import Product from "../models/productModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import slugify from "slugify";
import checkPermission from "../helpers/authHelper";
import { ProductTypes } from "../types/productTypes";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import ProductCategory from "../models/productCategoryModel";

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
      return res.status(403).json({ message: "Permission denied" });
    }

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    const { slug, name, subCategory } = body;

    // If slug is not provided, use the product name to create the slug
    const slugToUse = slug
      ? slugify(slug, { lower: true })
      : slugify(name, { lower: true });

    // Check if the slug is already in use
    const existingProduct = await Product.findOne({ slug: slugToUse });
    if (existingProduct) {
      return res.status(400).json({ message: "Slug already in use" });
    }

    // If subCategory is provided, fetch it and the parent category in one go
    let parentCategory;
    let subcategory = null;
    if (subCategory) {
      subcategory = await ProductCategory.findById(subCategory);
      if (!subcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }

      // Fetch parent category only if subcategory exists
      parentCategory = await ProductCategory.findById(
        subcategory.parentCategory
      );
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent category not found" });
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

    // Update subcategory and parent category (if subCategory exists)
    if (subcategory) {
      await Promise.all([
        ProductCategory.updateOne(
          { _id: subcategory._id },
          { $push: { products: createdProduct._id } }
        ),
        parentCategory && parentCategory._id
          ? ProductCategory.updateOne(
              { _id: parentCategory._id },
              { $push: { products: createdProduct._id } }
            )
          : Promise.resolve(),
      ]);
    }

    // Respond with the created product
    res
      .status(201)
      .json({ message: "Product created successfully", data: createdProduct });
  } catch (error) {
    next(new CustomError(500, "Error creating product"));
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

      // Check if the identifier is a valid MongoDB ObjectId
      if (idString.match(/^[0-9a-fA-F]{24}$/)) {
        // If identifier is an ObjectId, find product by ID
        product = await Product.findById(idString)
          .populate("userId category")
          .lean();
      } else {
        // If identifier is a slug, find product by slug
        product = await Product.findOne({ slug: idString })
          .populate("userId category")
          .lean();
      }

      if (!product) {
        return next(new CustomError(404, "Product not found!"));
      }

      return res.status(200).json({
        message: "Product found",
        data: product,
      });
    } else {
      // If no identifier is provided, return all products
      const products = await Product.find().populate("userId").lean();
      return res.status(200).json({
        message: "All products",
        data: products,
      });
    }
  } catch (error) {
    return next(error);
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
  const { userId, body } = req;
  const { query } = req.query;

  try {
    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 2);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    const idString = query.toString();

    // Find the product (either by ID or slug)
    let product;
    if (idString.match(/^[0-9a-fA-F]{24}$/)) {
      // Find product by ID
      product = await Product.findById(idString);
    } else {
      // Find product by slug
      product = await Product.findOne({ slug: idString });
    }

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the slug is being updated, and if it is, validate uniqueness
    if (body.slug && body.slug !== product.slug) {
      const existingSlugProduct = await Product.findOne({
        slug: slugify(body.slug, { lower: true }),
      });
      if (existingSlugProduct) {
        return res.status(400).json({ message: "Slug already in use" });
      }
      body.slug = slugify(body.slug, { lower: true });
    }

    // If subCategory is provided, fetch it and the parent category
    let parentCategory = null;
    let newSubcategory = null;
    if (
      body.subCategory &&
      body.subCategory !== product.subCategory?.toString()
    ) {
      newSubcategory = await ProductCategory.findById(body.subCategory);
      if (!newSubcategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
      // Fetch parent category if subcategory exists
      parentCategory = await ProductCategory.findById(
        newSubcategory.parentCategory
      );
      if (!parentCategory) {
        return res.status(404).json({ message: "Parent category not found" });
      }
    }

    // If subCategory is changing, update the categories
    if (
      body.subCategory &&
      body.subCategory !== product.subCategory?.toString()
    ) {
      // Remove product from the existing subcategory and category
      await Promise.all([
        ProductCategory.updateOne(
          { _id: product.subCategory },
          { $pull: { products: product._id } }
        ),
        ProductCategory.updateOne(
          { _id: product.category },
          { $pull: { products: product._id } }
        ),
      ]);

      // Set the new category to the parent category of the new subcategory
      body.category = parentCategory._id;

      // Add product to the new subcategory and its parent category
      await Promise.all([
        ProductCategory.updateOne(
          { _id: newSubcategory._id },
          { $push: { products: product._id } }
        ),
        ProductCategory.updateOne(
          { _id: parentCategory._id },
          { $push: { products: product._id } }
        ),
      ]);
    }

    // Ensure updatedBy is set to the current userId
    body.updatedBy = userId;

    // Update the product with the provided data
    const updatedProduct = await Product.findByIdAndUpdate(
      product._id,
      { $set: { ...body } },
      { new: true }
    );

    // Return the updated product data in the response
    res.status(200).json({
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
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
  const { userId } = req;
  const { query } = req.query;

  try {
    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 3);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const idString = query.toString();

    // Find the product (either by ID or slug)
    let product;
    if (idString.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idString);
    } else {
      product = await Product.findOne({ slug: idString });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Remove product from category and subcategory
    const categoryUpdate = ProductCategory.updateOne(
      { _id: product.category },
      { $pull: { products: product._id } }
    );

    const subCategoryUpdate = product.subCategory
      ? ProductCategory.updateOne(
          { _id: product.subCategory },
          { $pull: { products: product._id } }
        )
      : Promise.resolve();

    // Execute updates in parallel
    await Promise.all([categoryUpdate, subCategoryUpdate]);

    // Delete the product
    await Product.findByIdAndDelete(product._id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
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
  const { userId, params } = req;
  const { query } = req.query;

  try {
    // Check Permission
    const permissionCheck = await checkPermission(userId, "products", 0);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const idString = query.toString();

    // Find the product (either by ID or slug)
    let product;
    if (idString.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idString).lean();
    } else {
      product = await Product.findOne({ slug: idString }).lean();
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Prepare the duplicated product data
    const duplicatedProductData = {
      ...product,
      _id: new Types.ObjectId(),
      name: `${product.name} (Copy)`,
      slug: `${product.slug}-copy-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create the duplicated product
    const duplicatedProduct = await Product.create(duplicatedProductData);

    // Add duplicated product to the current category
    await ProductCategory.updateOne(
      { _id: duplicatedProduct.category },
      { $push: { products: duplicatedProduct._id } }
    );

    // If product has a parent category, add the duplicated product to the parent category as well
    if (product.subCategory) {
      await ProductCategory.updateOne(
        { _id: product.subCategory },
        { $push: { products: duplicatedProduct._id } }
      );
    }

    res.status(201).json({
      message: "Product duplicated successfully",
      data: duplicatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
