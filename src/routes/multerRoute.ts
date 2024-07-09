import express, { Router, Request, Response, NextFunction } from "express";
import { upload } from "../middlewares/multerMiddleware";
import fs from "fs";
import { CustomError } from "../middlewares/error";
import {
  deleteImage,
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
      const results = await fetchImagesInFolder("uploads");
      res.status(200).json({
        message: "Files fetched successfully",
        data: results,
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



// // Endpoint to upload files
// router.post(
//   "/upload",
//   verifyToken,
//   upload.array("files"),
//   (req: Request, res: Response) => {
//     console.log(req.files);
//     res.send("File uploaded successfully!");
//   }
// );

// // Endpoint to fetch files
// router.get("/files", async (req: Request, res: Response) => {
//   try {
//     const uploadsPath = path.join(__dirname, "..", "static", "uploads");
//     const files = await fs.promises.readdir(uploadsPath);
//     res.json({
//       files: files,
//     });
//     // res.send(files);
//   } catch (error) {
//     console.error("Error fetching files:", error);
//     throw new CustomError(500, "Error fetching files");
//   }
// });

// // Endpoint to delete files
// router.delete("/deleteFile", async (req: Request, res: Response) => {
//   const { fileName } = req.body;
//   try {
//     const uploadsPath = path.join(__dirname, "..", "static", "uploads");
//     await fs.promises.unlink(path.join(uploadsPath, fileName));
//     res.json({
//       message: "File deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting file:", error);
//     throw new CustomError(500, "Error deleting file");
//   }
// });