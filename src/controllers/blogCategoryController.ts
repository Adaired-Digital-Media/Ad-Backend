import BlogCategory from "../models/blogCategoryModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import {checkPermission} from "../helpers/authHelper";
import slugify from "slugify";
import mongoose from "mongoose";

// ********** Create Blog Category **********
const newBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { categoryName, categorySlug, parentCategory } = body;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogCategories", 0);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if categoryName or categorySlug is already in use
    const existingCategory = await BlogCategory.findOne({
      $or: [
        { categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") } },
        {
          categorySlug: slugify(categorySlug || categoryName, { lower: true }),
        },
      ],
    });

    if (existingCategory) {
      throw new CustomError(
        400,
        existingCategory.categoryName === categoryName
          ? "Category with this name already exists"
          : "Category with this slug already exists"
      );
    }

    // Create new category
    const newCategoryData = {
      ...body,
      categorySlug: slugify(categorySlug || categoryName, { lower: true }),
    };
    const newCategory = await BlogCategory.create(newCategoryData);

    // Update parent's subcategories
    if (parentCategory) {
      const parentCategoryData = await BlogCategory.findByIdAndUpdate(
        parentCategory,
        { $push: { subCategories: { categoryId: newCategory._id } } },
        { new: true }
      );
      if (!parentCategoryData) {
        throw new CustomError(404, "Parent category not found");
      }
    }

    res.status(201).json({
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Read Blog Categories **********
const readCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;

    let categories;

    if (categoryId) {
      // Convert categoryId to ObjectId
      const objectId = new mongoose.Types.ObjectId(categoryId);
      // Fetch a single category by ID
      categories = await BlogCategory.aggregate([
        { $match: { _id: objectId } },
        {
          $lookup: {
            from: "blogcategories",
            localField: "_id",
            foreignField: "parentCategory",
            as: "subcategories",
          },
        },
        {
          $project: {
            _id: 1,
            categoryName: 1,
            categorySlug: 1,
            parentCategory: 1,
            subcategories: {
              _id: 1,
              categoryName: 1,
              categorySlug: 1,
              parentCategory: 1,
            },
            status: 1,
          },
        },
      ]);

      if (!categories.length) {
        throw new CustomError(404, "Category not found");
      }
    } else {
      // Fetch all categories
      categories = await BlogCategory.aggregate([
        {
          $lookup: {
            from: "blogcategories",
            localField: "_id",
            foreignField: "parentCategory",
            as: "subcategories",
          },
        },
        {
          $project: {
            _id: 1,
            categoryName: 1,
            categorySlug: 1,
            parentCategory: 1,
            subcategories: {
              _id: 1,
              categoryName: 1,
              categorySlug: 1,
              parentCategory: 1,
            },
            status: 1,
          },
        },
      ]);
    }

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// ********** Update Category **********
const updateBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body, params } = req;
    const { categoryId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogCategories", 2);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if categoryName or categorySlug is already in use
    if (body.categoryName || body.categorySlug) {
      const existingCategory = await BlogCategory.findOne({
        $or: [
          {
            categoryName: {
              $regex: new RegExp("^" + body.categoryName + "$", "i"),
            },
          },
          {
            categorySlug: slugify(body.categorySlug || body.categoryName, {
              lower: true,
            }),
          },
        ],
        _id: { $ne: categoryId },
      });

      if (existingCategory) {
        throw new CustomError(
          400,
          existingCategory.categoryName === body.categoryName
            ? "Category with this name already exists"
            : "Category with this slug already exists"
        );
      }
    }

    // Update category
    const updatedCategoryData = {
      ...body,
    };

    // Only update categorySlug if it is present in the request body
    if (body.categorySlug) {
      updatedCategoryData.categorySlug = slugify(body.categorySlug, {
        lower: true,
      });
    }
    const updatedCategory = await BlogCategory.findByIdAndUpdate(
      categoryId,
      updatedCategoryData,
      { new: true }
    );

    if (!updatedCategory) {
      throw new CustomError(404, "Category not found");
    }

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Delete Category **********
const deleteBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, params } = req;
    const { categoryId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogCategories", 3);
    if (!permissionCheck) return;

    const category = await BlogCategory.findByIdAndDelete(categoryId);
    if (!category) {
      throw new CustomError(404, "Category not found");
    }

    // Remove category from parent's subcategories
    if (category.parentCategory) {
      await BlogCategory.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subCategories: { categoryId: category._id } } },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ********** Duplicate Category **********
const duplicateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, params } = req;
    const { categoryId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogCategories", 3);
    if (!permissionCheck) return;

    const category = await BlogCategory.findById(categoryId);
    if (!category) {
      throw new CustomError(404, "Category not found");
    }

    const duplicateCategory = await BlogCategory.create({
      categoryName: category.categoryName + " (Copy)",
      categorySlug: slugify(category.categoryName + " (Copy)", { lower: true }),
      parentCategory: category.parentCategory,
      status: category.status,
    });

    // Update parent's subcategories
    if (category.parentCategory) {
      await BlogCategory.findByIdAndUpdate(
        category.parentCategory,
        { $push: { subcategories: { _id: duplicateCategory._id } } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "Category duplicated successfully",
      data: duplicateCategory,
    });
  } catch (error) {
    next(error);
  }
};

export {
  newBlogCategory,
  readCategories,
  updateBlogCategory,
  deleteBlogCategory,
  duplicateCategory,
};
