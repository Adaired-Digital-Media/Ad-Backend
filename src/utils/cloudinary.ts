import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs";
import { CustomError } from "../middlewares/error";

// Cloudinary Configuration
try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} catch (configError) {
  console.error("Cloudinary configuration error:", configError);
  throw new CustomError(500, "Cloudinary configuration failed");
}

const removeFileExtension = (filename: string) => {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex === -1) return filename; // No extension found
  return filename.slice(0, dotIndex); // Slice to remove extension
};

// ********** Upload images to Cloudinary **********
export const uploadImages = async (
  files: Express.Multer.File[] | undefined
) => {
  try {
    if (!files || files.length === 0) return null;

    const uploadPromises = files.map((file) =>
      cloudinary.uploader
        .upload(file.path, {
          public_id: removeFileExtension(file.filename),
          resource_type: "auto",
          folder: "uploads",
        })
        .then((result) => {
          // Generate delivery URL with transformations
          const optimizedUrl = cloudinary.url(result.public_id, {
            resource_type: "auto",
            transformation: [{ fetch_format: "auto", quality: "auto" }],
            secure: true,
          });

          // fs.unlinkSync(file.path); // Delete the file after upload
          return { ...result, optimizedUrl };
        })
        .catch((error) => {
          console.error(`Error uploading file ${file.path}:`, error);
          throw error;
        })
    );

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    files.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error(`Error deleting file ${file.path}:`, unlinkError);
      }
    });
    throw new CustomError(500, "Image upload failed: " + error);
  }
};

// ********** Fetch All images from Cloudinary **********
export const fetchImagesInFolder = async (folderName: string) => {
  try {
    const { resources } = await cloudinary.search
      .expression(`folder:${folderName}`)
      .sort_by("public_id", "asc")
      .execute();

    return resources;
  } catch (error) {
    console.error("Error fetching images from Cloudinary:", error);
    throw new CustomError(500, "Failed to fetch images from Cloudinary");
  }
};

// ********** Delete image from Cloudinary **********
export const deleteImage = async (public_id: string) => {
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    if (result.result !== "ok") {
      throw new Error(`Failed to delete image with public ID: ${public_id}`);
    }
    return result;
  } catch (error) {
    throw new CustomError(500, `Failed to delete image: ${error}`);
  }
};
