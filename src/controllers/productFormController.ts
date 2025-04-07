import FormModel from "../models/productFormModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import {checkPermission} from "../helpers/authHelper";

// ***************************************
// ********** Create New Form ************
// ***************************************
export const createForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { body, userId } = req;
    let { productType, fields } = body;

    // Convert productType to lowercase
    productType = productType.toLowerCase();

    // check permissions
    const permissionCheck = await checkPermission(userId, "productforms", 0);
    if (!permissionCheck) {
      throw new CustomError(403, "Unauthorized");
    }

    //check if any form exists with same productType
    const existingForm = await FormModel.findOne({ productType });
    if (existingForm) {
      throw new CustomError(409, "Form already exists for this product type");
    }

    const form = await FormModel.create({
      productType,
      fields,
      createdBy: userId,
    });

    const populatedForm = await FormModel.findById(form._id).populate(
      "createdBy updatedBy",
      "name email role isAdmin"
    );

    res.status(201).json({ form: populatedForm });
  } catch (error) {
    next(new CustomError(500, "Error creating form"));
  }
};

// ***************************************
// ********** Read Form ******************
// ***************************************
export const readForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { formId } = req.query;

    if (formId) {
      const form = await FormModel.findById(formId);
      if (!form) {
        throw new CustomError(404, "Form not found");
      }
      const populatedForm = await FormModel.findById(form._id).populate(
        "createdBy updatedBy",
        "name email role isAdmin"
      );
      res.json({ form: populatedForm });
    } else {
      const forms = await FormModel.find();
      const populatedForms = await Promise.all(
        forms.map(async (form) => {
          return await FormModel.findById(form._id).populate(
            "createdBy updatedBy",
            "name email role isAdmin"
          );
        })
      );

      res.json({ forms: populatedForms });
    }
  } catch (error) {
    next(new CustomError(500, "Error reading form"));
  }
};

// ***************************************
// ********** Update Form ****************
// ***************************************
export const updateForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, body, query } = req;
    const { formId } = query as { formId?: string };

    // Validate query params
    if (!formId) {
      return next(
        new CustomError(400, "Missing required query parameter: formId")
      );
    }

    // check permissions
    const permissionCheck = await checkPermission(userId, "productforms", 2);
    if (!permissionCheck) {
      throw new CustomError(403, "Unauthorized");
    }

    // Update the form
    const updatedForm = await FormModel.findByIdAndUpdate(formId, body, {
      new: true,
    });
    if (!updatedForm) {
      return next(new CustomError(404, "Form not found"));
    }
    const populatedForm = await FormModel.findById(updatedForm._id).populate(
      "createdBy updatedBy",
      "name email role isAdmin"
    );
    // Respond with the updated form
    res.status(200).json({ form: populatedForm });
  } catch (error) {
    next(
      error instanceof CustomError
        ? error
        : new CustomError(500, "Error updating form")
    );
  }
};

// ***************************************
// ********** Delete Form ****************
// ***************************************
export const deleteForm = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req;
    const { formId } = req.query;

    // check permissions
    const permissionCheck = await checkPermission(userId, "productforms", 3);
    if (!permissionCheck) {
      throw new CustomError(403, "Unauthorized");
    }

    const form = await FormModel.findByIdAndDelete(formId);
    if (!form) {
      throw new CustomError(404, "Form not found");
    }

    res.status(200).json({
      message: "Form deleted successfully",
    });
  } catch (error) {
    next(new CustomError(500, "Error deleting form"));
  }
};
