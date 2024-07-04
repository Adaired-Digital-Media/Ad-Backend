import { validationResult } from "express-validator";
import CaseStudy from "../models/caseStudyModel";
import CaseStudyCategories from "../models/caseStudyCategoryModel";
import { Request, Response, NextFunction } from "express";
import checkPermission from "../helpers/authHelper";
import slugify from "slugify";
import mongoose from "mongoose";
import { CustomError } from "../middlewares/error";

interface Technology {
  _id: string;
  icon: string;
  name: string;
}

interface CaseStudyBody {
  categoryId: string;
  slug: string;
  technologiesUsed: { id: string }[];
  [key: string]: any;
}

//  ********** Create Case Study **********
const createCaseStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body } = req;
    const { categoryId, slug, technologiesUsed }: CaseStudyBody = body;

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
      slug: slugify(slug, { lower: true }),
    });
    if (existingCaseStudy) {
      return res.status(400).json({
        message: "Case study with this slug already exists",
      });
    }

    // Find and validate selected category
    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const selectedCategory = await CaseStudyCategories.findById(categoryId);
    if (!selectedCategory) {
      return res.status(400).json({
        message: "Category not found",
      });
    }

    // Filter technologies whose IDs match with technologiesUsed IDs
    const techUsed = (selectedCategory.technologies as Technology[]).filter(
      (tech) =>
        technologiesUsed.some(
          (usedTech) => tech._id.toString() === usedTech.id.toString()
        )
    );

    // Map the filtered technologies to the required format
    const mappedTechnologiesUsed = techUsed.map((tech) => ({
      icon: tech.icon,
      name: tech.name,
    }));

    // Create case study with selected category
    const newCaseStudyData = {
      ...body,
      technologiesUsed: mappedTechnologiesUsed,
      categorySlug: selectedCategory.categorySlug,
      slug: slugify(slug, { lower: true }),
    };

    const newCaseStudy = await CaseStudy.create(newCaseStudyData);

    // Add case study to its category's caseStudies array
    await CaseStudyCategories.findByIdAndUpdate(
      selectedCategory._id,
      { $push: { caseStudies: { caseStudyId: newCaseStudy._id } } },
      { new: true }
    );

    // Response
    res.status(201).json({
      message: "Case study created successfully",
      data: newCaseStudy,
    });
  } catch (error) {
    next(error);
  }
};

// ********** Read Case Study **********
const readCaseStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { identifier } = req.params;

    if (identifier) {
      let caseStudy;
      // Check if the identifier is a valid MongoDB ObjectId
      if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
        caseStudy = await CaseStudy.findById(identifier).lean();
      } else {
        caseStudy = await CaseStudy.findOne({ slug: identifier }).lean();
      }

      if (!caseStudy) {
        return next(new CustomError(404, "Case Study not found!"));
      }

      return res.status(200).json(caseStudy);


    } else {
      // Fetch all case studies
      const caseStudies = await CaseStudy.find({});
      res.status(200).json({
        message: "Case studies fetched successfully",
        data: caseStudies,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ********** Update Case Study **********
const updateCaseStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body, params } = req;
    const { categoryId, slug, technologiesUsed }: CaseStudyBody = body;
    const { caseStudyId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "caseStudies", 2);
    if (!permissionCheck) return res.status(403).json({ message: "Forbidden" });

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if case study exists
    const existingCaseStudy = await CaseStudy.findById(caseStudyId);
    if (!existingCaseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    // Use existing category ID if categoryId is not provided
    const effectiveCategoryId =
      categoryId || existingCaseStudy.categoryId.toString();

    // Check if new slug already exists (if slug is being updated)
    if (slug) {
      const existingSlug = await CaseStudy.findOne({
        slug: slugify(slug, { lower: true }),
        _id: { $ne: caseStudyId },
      });
      if (existingSlug) {
        return res.status(400).json({
          message: "Case study with this slug already exists",
        });
      }
    }

    // Find and validate selected category
    let selectedCategory;
    if (mongoose.Types.ObjectId.isValid(effectiveCategoryId)) {
      selectedCategory = await CaseStudyCategories.findById(
        effectiveCategoryId
      );
      if (!selectedCategory) {
        return res.status(400).json({
          message: "Category not found",
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Filter technologies whose IDs match with technologiesUsed IDs
    let mappedTechnologiesUsed;
    if (technologiesUsed) {
      const techUsed = (selectedCategory.technologies as Technology[]).filter(
        (tech) =>
          technologiesUsed.some(
            (usedTech) => tech._id.toString() === usedTech.id.toString()
          )
      );

      // Map the filtered technologies to the required format
      mappedTechnologiesUsed = techUsed.map((tech) => ({
        icon: tech.icon,
        name: tech.name,
      }));
    }

    // Update case study with new data
    const updatedCaseStudyData = {
      ...body,
      technologiesUsed:
        mappedTechnologiesUsed || existingCaseStudy.technologiesUsed,
      categorySlug:
        selectedCategory?.categorySlug || existingCaseStudy.categorySlug,
      slug: slug ? slugify(slug, { lower: true }) : existingCaseStudy.slug,
    };

    const updatedCaseStudy = await CaseStudy.findByIdAndUpdate(
      caseStudyId,
      updatedCaseStudyData,
      { new: true }
    );

    // Update case study in its category's caseStudies array if category is changed
    if (
      categoryId &&
      selectedCategory._id.toString() !==
        existingCaseStudy.categoryId.toString()
    ) {
      await CaseStudyCategories.findByIdAndUpdate(
        existingCaseStudy.categoryId,
        { $pull: { caseStudies: { caseStudyId: existingCaseStudy._id } } },
        { new: true }
      );

      await CaseStudyCategories.findByIdAndUpdate(
        selectedCategory._id,
        { $push: { caseStudies: { caseStudyId: updatedCaseStudy._id } } },
        { new: true }
      );
    }

    // Response
    res.status(200).json({
      message: "Case study updated successfully",
      data: updatedCaseStudy,
    });
  } catch (error) {
    next(error);
  }
};

//  ********** Delete Case Study **********

const deleteCaseStudy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, params } = req;
    const { caseStudyId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "caseStudies", 3);
    if (!permissionCheck) return;

    // Check if case study exists
    const existingCaseStudy = await CaseStudy.findById(caseStudyId);
    if (!existingCaseStudy) {
      return res.status(404).json({ message: "Case study not found" });
    }

    // Remove case study from its category's caseStudies array
    await CaseStudyCategories.findByIdAndUpdate(
      existingCaseStudy.categoryId,
      { $pull: { caseStudies: { caseStudyId: existingCaseStudy._id } } },
      { new: true }
    );

    // Delete the case study
    await CaseStudy.findByIdAndDelete(caseStudyId);

    // Response
    res.status(200).json({ message: "Case study deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export { createCaseStudy, readCaseStudy, updateCaseStudy, deleteCaseStudy };
