import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { CustomError } from "../middlewares/error";

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image to cloudinary
export const uploadImage = async (file: Express.Multer.File | undefined) => {
  try {
    if (!file) return null;
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
      folder: "adaired",
    });
    // fs.unlinkSync(file.path); // Uncomment this line if you want to delete the file after upload
    return result;
  } catch (error) {
    fs.unlinkSync(file.path);
    throw new CustomError(500, "Image upload failed: " + error);
  }
};
