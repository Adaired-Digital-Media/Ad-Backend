"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const error_1 = require("../middlewares/error");
// Cloudinary Configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Upload image to cloudinary
const uploadImage = async (file) => {
    try {
        if (!file)
            return null;
        const result = await cloudinary_1.v2.uploader.upload(file.path, {
            resource_type: "auto",
            folder: "adaired",
        });
        // fs.unlinkSync(file.path); // Uncomment this line if you want to delete the file after upload
        return result;
    }
    catch (error) {
        fs_1.default.unlinkSync(file.path);
        throw new error_1.CustomError(500, "Image upload failed: " + error);
    }
};
exports.uploadImage = uploadImage;
