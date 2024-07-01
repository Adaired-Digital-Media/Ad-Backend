"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newBlogCategory = void 0;
const blogCategoryModel_1 = __importDefault(require("../models/blogCategoryModel"));
const error_1 = require("../middlewares/error");
const express_validator_1 = require("express-validator");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
const slugify_1 = __importDefault(require("slugify"));
// Create a new blog category
const newBlogCategory = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const { categoryName, categorySlug, isSubCategory, parentCategory } = body;
        // Check permissions
        const permissionCheck = await (0, authHelper_1.default)(userId, "blogCategories", 0);
        if (!permissionCheck)
            return;
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        // Check if categoryName or categorySlug is already in use
        const existingCategory = await blogCategoryModel_1.default.findOne({
            $or: [
                { categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") } },
                {
                    categorySlug: (0, slugify_1.default)(categorySlug || categoryName, { lower: true }),
                },
            ],
        });
        if (existingCategory) {
            throw new error_1.CustomError(400, existingCategory.categoryName === categoryName
                ? "Category with this name already exists"
                : "Category with this slug already exists");
        }
        // Create new category
        const newCategoryData = {
            ...body,
            categorySlug: (0, slugify_1.default)(categorySlug || categoryName, { lower: true }),
        };
        const newCategory = await blogCategoryModel_1.default.create(newCategoryData);
        // Update parent's subcategories
        if (isSubCategory && parentCategory) {
            const parentCategoryData = await blogCategoryModel_1.default.findByIdAndUpdate(parentCategory, { $push: { subCategories: { categoryId: newCategory._id } } }, { new: true });
            if (!parentCategoryData) {
                throw new error_1.CustomError(404, "Parent category not found");
            }
        }
        res.status(201).json({
            message: "Category created successfully",
            data: newCategory,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.newBlogCategory = newBlogCategory;
