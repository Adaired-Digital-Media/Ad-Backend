import express, { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/multerMiddleware";
import { CustomError } from "../middlewares/error";
import {
  deleteImage,
  fetchImageByPublicId,
  fetchImagesInFolder,
  uploadImages,
  editImageInfo, // Import the editImageInfo function
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

// Route to get uploaded media
router.get(
  "/getUploadedMedia",
  async (req: Request, res: Response, next: NextFunction) => {
    const { page = 1, limit = 100, fileType = "all" } = req.query; // Extract fileType from query
    try {
      // Ensure page and limit are numbers and handle invalid inputs
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Call the fetchImagesInFolder function with the new fileType parameter
      const results = await fetchImagesInFolder(pageNumber, limitNumber, fileType as "svg" | "non-svg" | "all");
      res.status(200).json({
        message: "Files fetched successfully",
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
);


// Route to get image by public ID
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

// Route to delete file by public ID
router.delete(
  "/deleteFile/:public_id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { public_id } = req.params;
    try {
      const result = await deleteImage(public_id);

      if (result.result === "ok") {
        res.json({
          message: "Image deleted successfully",
        });
      } else {
        throw new CustomError(500, "Failed to delete image from Cloudinary");
      }
    } catch (error) {
      next(error);
    }
  }
);

// Route to edit image metadata
router.put(
  "/editImage/:public_id",
  async (req: Request, res: Response, next: NextFunction) => {
    const { public_id } = req.params;
    const { title, description } = req.body;

    try {
      const result = await editImageInfo(public_id, title, description);
      res.status(200).json({
        message: "Image metadata updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
