"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBlog = exports.newBlog = void 0;
const blogModel_1 = __importDefault(require("../models/blogModel"));
const blogCategoryModel_1 = __importDefault(require("../models/blogCategoryModel"));
const error_1 = require("../middlewares/error");
const express_validator_1 = require("express-validator");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
const slugify_1 = __importDefault(require("slugify"));
// Create a new blog
const newBlog = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const { blogSlug, blogCategory } = body;
        // Check permissions
        const permissionCheck = await (0, authHelper_1.default)(userId, "blogs", 0);
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
        // Check if blogSlug is already in use
        const existingBlog = await blogModel_1.default.findOne({
            blogSlug: (0, slugify_1.default)(blogSlug, { lower: true }),
        });
        if (existingBlog) {
            throw new error_1.CustomError(400, "Blog with this slug already exists");
        }
        // Create new blog
        const newBlogData = {
            ...body,
            blogAuthor: userId,
            blogSlug: (0, slugify_1.default)(blogSlug, { lower: true }),
        };
        const newBlog = await blogModel_1.default.create(newBlogData);
        // Update blog category
        const blogCategoryData = await blogCategoryModel_1.default.findByIdAndUpdate(blogCategory, {
            $push: { blogs: { blogId: newBlog._id } },
        }, { new: true });
        res.status(201).json({
            message: "Blog created successfully",
            newBlog,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.newBlog = newBlog;
// Update a blog
const updateBlog = async (req, res, next) => {
    try {
        const { userId, body } = req;
        const { blogId, ...updateData } = body;
        // Check permissions
        const permissionCheck = await (0, authHelper_1.default)(userId, "blogs", 2);
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
        // Check if blog exists and fetch it
        const blog = await blogModel_1.default.findById(blogId);
        if (!blog) {
            throw new error_1.CustomError(404, "Blog not found");
        }
        // Combine checking if slug exists and update blog
        if (updateData.blogSlug) {
            const slug = (0, slugify_1.default)(updateData.blogSlug, { lower: true });
            const existingBlog = await blogModel_1.default.findOne({
                blogSlug: slug,
                _id: { $ne: blogId },
            });
            if (existingBlog) {
                throw new error_1.CustomError(400, "Blog with this slug already exists");
            }
            updateData.blogSlug = slug; // Update slug in updateData
        }
        // Use update operators for efficiency
        const updatedBlog = await blogModel_1.default.findByIdAndUpdate(blogId, { $set: updateData }, { new: true });
        res.status(200).json({
            message: "Blog updated successfully",
            updatedBlog,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateBlog = updateBlog;
