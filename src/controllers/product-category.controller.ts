import Category from "../models/productCategoryModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import slugify from "slugify";
import {checkPermission} from "../helpers/authHelper";
import { CategoryTypes } from "../types/productTypes";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import ProductCategory from "../models/productCategoryModel";

// ***************************************
// ********** Create Category **************
// ***************************************
export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "product-categories", 0);
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

    const { slug, name, parentCategory } = body;

    // If slug is not provided, use the category name to create the slug
    const slugToUse = slug
      ? slugify(slug, { lower: true })
      : slugify(name, { lower: true });

    // Check if the slug is already in use
    const existingCategory = await Category.findOne({
      slug: slugToUse,
    });
    if (existingCategory) {
      return res.status(400).json({ message: "Slug already in use" });
    }

    // Create category
    const newCategory: CategoryTypes = {
      ...body,
      slug: slugToUse,
      createdBy: body.userId ? body.userId : userId,
    };
    const createdCategory = await Category.create(newCategory);

    // If it has a parent (i.e., it's a subcategory), push its ID to the parent's `children` array
    if (parentCategory) {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $push: { children: createdCategory._id } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Category created successfully",
      data: createdCategory,
    });
  } catch (error) {
    throw new CustomError(400, "Something went wrong");
  }
};

// ***************************************
// ********** Read Category ****************
// ***************************************
export const readCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { identifier, children, products, childrenProducts } = req.query;

    // If no identifier is provided, return all categories
    if (!identifier) {
      const categories = await Category.find().populate("parentCategory");
      return res.status(200).json({
        message: "All categories",
        data: categories,
      });
    }

    identifier = String(identifier);
    const pipeline: any[] = [];

    // Match based on the identifier (ObjectId or slug)
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      pipeline.push({ $match: { _id: new Types.ObjectId(identifier) } });
    } else {
      pipeline.push({ $match: { slug: identifier } });
    }

    // Populate `children` if `children=true`
    if (children === "true") {
      pipeline.push({
        $lookup: {
          from: "productcategories",
          localField: "children",
          foreignField: "_id",
          as: "children",
        },
      });

      // Populate `children.products` if `childrenProducts=true`
      if (childrenProducts === "true") {
        pipeline.push(
          { $unwind: "$children" },
          {
            $lookup: {
              from: "products",
              localField: "children.products",
              foreignField: "_id",
              as: "children.products",
            },
          },
          {
            $group: {
              _id: "$_id",
              children: { $push: "$children" },
              root: { $first: "$$ROOT" },
            },
          },
          {
            $replaceRoot: {
              newRoot: {
                $mergeObjects: ["$root", { children: "$children" }],
              },
            },
          }
        );
      }
    }

    // Populate `products` if `products=true`
    if (products === "true") {
      pipeline.push({
        $lookup: {
          from: "products",
          localField: "products",
          foreignField: "_id",
          as: "products",
        },
      });
    }

    // Execute aggregation
    const category = await Category.aggregate(pipeline);

    if (!category || category.length === 0) {
      return next(new CustomError(404, "Category not found!"));
    }

    return res.status(200).json({
      message: "Category found",
      data: category[0],
    });
  } catch (error: any) {
    return next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Update Category **************
// ***************************************
export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    let { identifier } = req.query;

    // Check Permission
    const permissionCheck = await checkPermission(userId, "product-categories", 2);
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

    identifier = String(identifier);

    // Find the category (either by ID or slug)
    let category;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // Find category by ID
      category = await Category.findById(identifier);
    } else {
      // Find category by slug
      category = await Category.findOne({ slug: identifier });
    }

    // Check if the category exists
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if the slug is being updated, and if it is, validate uniqueness
    if (body.slug && body.slug !== category.slug) {
      const existingSlugCategory = await Category.findOne({
        slug: slugify(body.slug, { lower: true }),
      });
      if (existingSlugCategory) {
        return res.status(400).json({ message: "Slug already in use" });
      }
      body.slug = slugify(body.slug, { lower: true });
    }

    // If parent category is changing, update the old and new categories
    if (
      body.parentCategory &&
      body.parentCategory !== category.parentCategory
    ) {
      // Update the old parent category's children array
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { children: category._id } },
        { new: true }
      );

      // Update the new parent category's children array
      await Category.findByIdAndUpdate(
        body.parentCategory,
        { $push: { children: category._id } },
        { new: true }
      );
    }

    body.updatedBy = userId;

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      category._id,
      { $set: { ...body } },
      { new: true }
    );

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ***************************************
// ********** Delete Category **************
// ***************************************
export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  let { identifier } = req.query;

  try {
    // Check Permission
    const permissionCheck = await checkPermission(userId, "product-categories", 3);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    identifier = String(identifier);

    // Find the category (either by ID or slug)
    let category;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier);
    } else {
      category = await Category.findOne({ slug: identifier });
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await ProductCategory.findByIdAndUpdate(category.parentCategory, {
      $pull: { children: category._id },
    });

    // Delete the category
    await Category.findByIdAndDelete(category._id);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    return next(new CustomError(500, error.message));
  }
};

// ***************************************
// ********** Duplicate Category ***********
// ***************************************
export const duplicateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId, params } = req;
  let { identifier } = req.query;

  try {
    // Check Permission
    const permissionCheck = await checkPermission(userId, "product-categories", 0);
    if (!permissionCheck) {
      return res.status(403).json({ message: "Permission denied" });
    }

    identifier = String(identifier);

    // Find the category (either by ID or slug)
    let category;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(identifier).lean();
    } else {
      category = await Category.findOne({ slug: identifier }).lean();
    }

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prepare the duplicated category data
    const duplicatedCategoryData = {
      ...category,
      _id: new Types.ObjectId(),
      name: `${category.name} (Copy)`,
      slug: `${category.slug}-copy-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create the duplicated category
    const duplicatedCategory = await Category.create(duplicatedCategoryData);

    await ProductCategory.findByIdAndUpdate(duplicatedCategory.parentCategory, {
      $push: { children: duplicatedCategory._id },
    });

    res.status(201).json({
      message: "Category duplicated successfully",
      data: duplicatedCategory,
    });
  } catch (error) {
    next(error);
  }
};
