import BlogCategory from "../models/blogCategoryModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";
import slugify from "slugify";

// Create a new blog category
const newBlogCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { categoryName, categorySlug, isSubCategory, parentCategory } = body;

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
    if (isSubCategory && parentCategory) {
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

export { newBlogCategory };
