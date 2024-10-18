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
        })
        .then((result) => {
          const optimizedUrl = cloudinary.url(result.public_id, {
            resource_type: "auto",
            transformation: [{ fetch_format: "auto", quality: "auto" }],
            secure: true,
          });
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

// *********** Fetch Image By Public ID **********

export const fetchImageByPublicId = async (public_id: string) => {
  try {
    const result = await cloudinary.search
      .expression(`public_id:${public_id}`)
      .execute();
    return result;
  } catch (error) {
    console.error("Error fetching image by public ID:", error);
    throw new CustomError(500, "Failed to fetch image by public ID");
  }
};

// ********** Fetch All images from Cloudinary with Pagination **********
export const fetchImagesInFolder = async (
  page: number = 1,
  limit: number = 100,
  fileType: "svg" | "non-svg" | "all" = "all" 
) => {
  try {
    let resources: any[] = [];
    let nextCursor: string | undefined = undefined;
    const maxResults = Math.min(limit, 500);
    let skip = (page - 1) * limit;

    // Constructing the search expression based on the fileType parameter
    let expression = `folder:""`;
    if (fileType === "svg") {
      expression += ` AND resource_type:image AND format:svg`; // Only SVG images
    } else if (fileType === "non-svg") {
      expression += ` AND resource_type:image AND NOT format:svg`; // All non-SVG images
    } // If "all", we don't modify the expression

    do {
      const { resources: batch, next_cursor } = await cloudinary.search
        .expression(expression)
        .sort_by("created_at", "desc")
        .max_results(maxResults)
        .with_field("context")
        .next_cursor(nextCursor)
        .execute();

      if (skip > 0) {
        if (skip < batch.length) {
          resources = resources.concat(batch.slice(skip));
        }
        skip = 0;
      } else {
        resources = resources.concat(batch);
      }
      nextCursor = next_cursor;
    } while (nextCursor && resources.length < limit);

    resources = resources.slice(0, limit);
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

// ********** Edit image info from Cloudinary **********
export const editImageInfo = async (
  public_id: string,
  title?: string,
  description?: string
) => {
  try {
    const updateOptions: any = {};
    if (title) {
      updateOptions.context = { caption: title };
    }
    if (description) {
      updateOptions.context = { ...updateOptions.context, alt: description };
    }
    const result = await cloudinary.uploader.explicit(public_id, {
      type: "upload",
      ...updateOptions,
    });
    return result;
  } catch (error) {
    console.error("Error editing image info:", error);
    throw new CustomError(500, `Failed to edit image info: ${error}`);
  }
};
