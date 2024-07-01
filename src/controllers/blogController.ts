import Blog from "../models/blogModel";
import BlogCategory from "../models/blogCategoryModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";
import slugify from "slugify";

// Create a new blog
const newBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, body } = req;
    const { blogSlug, blogCategory } = body;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogs", 0);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if blogSlug is already in use
    const existingBlog = await Blog.findOne({
      blogSlug: slugify(blogSlug, { lower: true }),
    });
    if (existingBlog) {
      throw new CustomError(400, "Blog with this slug already exists");
    }

    // Create new blog
    const newBlogData = {
      ...body,
      blogAuthor: userId,
      blogSlug: slugify(blogSlug, { lower: true }),
    };
    const newBlog = await Blog.create(newBlogData);

    // Update blog category
    const blogCategoryData = await BlogCategory.findByIdAndUpdate(
      blogCategory,
      {
        $push: { blogs: { blogId: newBlog._id } },
      },
      { new: true }
    );

    res.status(201).json({
      message: "Blog created successfully",
      newBlog,
    });
  } catch (error) {
    next(error);
  }
};

// Update a blog
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, body } = req;
    const { blogId, ...updateData } = body;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogs", 2);
    if (!permissionCheck) return;

    // Validate user input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid input",
        errors: errors.array(),
      });
    }

    // Check if blog exists and fetch it
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new CustomError(404, "Blog not found");
    }

    // Combine checking if slug exists and update blog
    if (updateData.blogSlug) {
      const slug = slugify(updateData.blogSlug, { lower: true });
      const existingBlog = await Blog.findOne({
        blogSlug: slug,
        _id: { $ne: blogId },
      });
      if (existingBlog) {
        throw new CustomError(400, "Blog with this slug already exists");
      }
      updateData.blogSlug = slug; // Update slug in updateData
    }

    // Use update operators for efficiency
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { $set: updateData },
      { new: true }
    );

    res.status(200).json({
      message: "Blog updated successfully",
      updatedBlog,
    });
  } catch (error) {
    next(error);
  }
};

export { newBlog, updateBlog };
