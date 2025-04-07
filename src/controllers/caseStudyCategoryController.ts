import { validationResult } from "express-validator";
import { CustomError } from "../middlewares/error";
import CaseStudyCategories from "../models/caseStudyCategoryModel";
import { Request, Response, NextFunction } from "express";
import {checkPermission} from "../helpers/authHelper";
import slugify from "slugify";
import mongoose from "mongoose";

// ********** Create CaseStudy Category ***********
const newCaseStudyCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { categoryName, categorySlug } = body;

    // Check permissions
    const permissionCheck = await checkPermission(
      userId,
      "caseStudyCategories",
      0
    );
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
    const existingCategory = await CaseStudyCategories.findOne({
      $or: [
        {
          categoryName: {
            $regex: categoryName,
            $options: "i",
          },
        },
        {
          categorySlug: slugify(categorySlug, { lower: true }),
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
      categoryName: categoryName.trim(),
      categorySlug: slugify(categorySlug , { lower: true }),
    };
    const newCategory = await CaseStudyCategories.create(newCategoryData);

    res.status(201).json({
      message: "Case Study Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Read CaseStudy Categories **********
const readCaseStudyCategories = async (
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
      categories = await CaseStudyCategories.aggregate([
        { $match: { _id: objectId } },
        {
          $project: {
            _id: 1,
            categoryName: 1,
            categorySlug: 1,
            technologies: 1,
            caseStudies: 1,
            status: 1,
          },
        },
      ]);

      if (!categories.length) {
        throw new CustomError(404, "Category not found");
      }
    } else {
      // Fetch all categories
      categories = await CaseStudyCategories.aggregate([
        {
          $project: {
            _id: 1,
            categoryName: 1,
            categorySlug: 1,
            technologies: 1,
            caseStudies: 1,
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

// ********** Update CaseStudy Category **********
const updateCaseStudyCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body, params } = req;
    const { categoryId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "caseStudyCategories", 2);
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
      const existingCategory = await CaseStudyCategories.findOne({
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
    const updatedCategory = await CaseStudyCategories.findByIdAndUpdate(
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

// ********** Delete CaseStudy Category **********
const deleteCaseStudyCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, params } = req;
    const { categoryId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "caseStudyCategories", 3);
    if (!permissionCheck) return;

    const category = await CaseStudyCategories.findByIdAndDelete(categoryId);
    if (!category) {
      throw new CustomError(404, "Category not found");
    }

    res.status(200).json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export {
  newCaseStudyCategory,
  readCaseStudyCategories,
  updateCaseStudyCategory,
  deleteCaseStudyCategory,
};
