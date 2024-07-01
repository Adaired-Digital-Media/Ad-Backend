import express, { Router, Request, Response } from "express";
import { upload } from "../middlewares/multerMiddleware";
import verifyToken from "../middlewares/authMiddleware";
import fs from "fs";
import path from "path";
import { CustomError } from "../middlewares/error";

const router: Router = express.Router();

// Endpoint to upload files
router.post(
  "/upload",
  verifyToken,
  upload.array("files"),
  (req: Request, res: Response) => {
    console.log(req.files);
    res.send("File uploaded successfully!");
  }
);

// Endpoint to fetch files
router.get("/files", async (req: Request, res: Response) => {
  try {
    const uploadsPath = path.join(__dirname, "..", "static", "uploads");
    const files = await fs.promises.readdir(uploadsPath);
    res.json({
      files: files,
    });
    // res.send(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    throw new CustomError(500, "Error fetching files");
  }
});

// Endpoint to delete files
router.delete("/deleteFile", async (req: Request, res: Response) => {
  const { fileName } = req.body;
  try {
    const uploadsPath = path.join(__dirname, "..", "static", "uploads");
    await fs.promises.unlink(path.join(uploadsPath, fileName));
    res.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new CustomError(500, "Error deleting file");
  }
});

export default router;
