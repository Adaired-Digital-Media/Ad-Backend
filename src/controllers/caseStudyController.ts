import { validationResult } from "express-validator";
import { CustomError } from "../middlewares/error";
import CaseStudy from "../models/caseStudyModel";
import CaseStudyCategories from "../models/caseStudyCategoryModel";
import { Request, Response, NextFunction } from "express";
import checkPermission from "../helpers/authHelper";
import slugify from "slugify";
import mongoose from "mongoose";

//  ********** Create Case Study **********
const newCaseStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { categoryId, caseStudySlug } = body;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "caseStudies", 0);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if case study slug already exists
    const existingCaseStudy = await CaseStudy.findOne({
      caseStudySlug,
    });
    if (existingCaseStudy) {
      return res.status(400).json({
        message: "Case study slug already exists",
      });
    }

    // Find selected category
    if (categoryId) {
      // Ensure categoryId is a valid string
      if (
        typeof categoryId === "string" &&
        mongoose.Types.ObjectId.isValid(categoryId)
      ) {
        const objectId = new mongoose.Types.ObjectId(categoryId);
        // Use objectId as needed

        const category = await CaseStudyCategories.aggregate([
          { $match: { _id: objectId } },
          {
            $lookup: {
              from: "casestudycategories",
              localField: "_id",
              foreignField: "_id",
              as: "category",
            },
          },
          { $unwind: "$category" },
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
        if (!category.length) {
          return res.status(400).json({
            message: "Category not found",
          });
        }

        // Create 
      } else {
        return res.status(400).json({
          message: "Invalid category ID",
        });
      }
    }

    // Continue with creating the case study...
  } catch (error) {
    next(error);
  }
};

export default newCaseStudy;
