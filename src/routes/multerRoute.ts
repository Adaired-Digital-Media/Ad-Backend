import express, { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/multerMiddleware";
import fs from "fs";
import { CustomError } from "../middlewares/error";
import {
  deleteImage,
  fetchImageByPublicId,
  fetchImagesInFolder,
  uploadImages,
} from "../utils/cloudinary";

const router: Router = express.Router();

// Endpoint to upload files
router.post(
  "/upload",
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        throw new CustomError(400, "No files uploaded");
      }

      const results = await uploadImages(files);
      res.status(200).json({
        message: "Files uploaded successfully",
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getUploadedMedia",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const results = await fetchImagesInFolder();
      res.status(200).json({
        message: "Files fetched successfully",
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/getSvgMedia",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Fetch all images in the folder
      const results = await fetchImagesInFolder();

      // Filter for SVG images only
      const svgImages = results.filter(
        (image: { format: string }) => image.format === "svg"
      );

      res.status(200).json({
        message: "SVG images fetched successfully",
        data: svgImages,
      });
    } catch (error) {
      next(error);
    }
  }
);


router.get(
  "/getImageByPublicId/:public_id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { public_id } = req.params;
    try {
      const result = await fetchImageByPublicId(public_id);
      res.status(200).json({
        message: "Image fetched successfully",
        data: result.resources[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/deleteFile/:public_id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { public_id } = req.params;
    console.log(public_id);

    try {
      // Delete the image from Cloudinary
      const result = await deleteImage(public_id);

      // Check if deletion was successful
      if (result.result === "ok") {
        res.json({
          message: "Image deleted successfully",
        });
      } else {
        throw new CustomError(500, "Failed to delete image from Cloudinary");
      }
    } catch (error) {
      next(error); // Pass the error to the error handling middleware
    }
  }
);

export default router;