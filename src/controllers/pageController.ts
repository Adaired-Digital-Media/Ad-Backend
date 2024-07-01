import Page from "../models/pageModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";

// Create a new page
const newPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate user input
    const {
      metaTitle,
      metaDescription,
      canonicalLink,
      openGraphImage,
      robotsText,
      focusKeyword,
      bodyData,
    } = req.body;
    if (!metaTitle || !metaDescription || !canonicalLink || !focusKeyword) {
      throw new CustomError(400, "All fields are required");
    }
    // Create new page
    const newPage = new Page({
      metaTitle,
      metaDescription,
      canonicalLink,
      openGraphImage,
      robotsText,
      focusKeyword,
      bodyData,
    });
    await newPage.save();
    res.status(201).json({
      message: "Page created successfully",
      data: newPage,
    });
  } catch (error) {
    next(error);
  }
};

// Find Pages
const findPages = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;
  if (id) {
    try {
      const page = await Page.findById(id);
      if (!page) {
        throw new CustomError(404, "Page not found!");
      }
      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  } else {
    try {
      const pages = await Page.find();
      res.status(200).json(pages);
    } catch (error) {
      next(error);
    }
  }
};

export { newPage, findPages };
