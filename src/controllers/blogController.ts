import Blog from "../models/blogModel";
import BlogCategory from "../models/blogCategoryModel";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../middlewares/error";
import { validationResult } from "express-validator";
import checkPermission from "../helpers/authHelper";
import slugify from "slugify";

// ********** Create Blog ***********
const newBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, body } = req;
    const { postTitle, slug, category } = body;

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

    // Determine the slug
    const finalSlug = slug
      ? slugify(slug, { lower: true })
      : slugify(postTitle, { lower: true });

    // Check if blogSlug is already in use
    const existingBlog = await Blog.findOne({ slug: finalSlug });
    if (existingBlog) {
      throw new CustomError(400, "Blog with this slug already exists");
    }

    // Create new blog
    const newBlogData = {
      ...body,
      blogAuthor: userId,
      slug: finalSlug,
    };
    const newBlog = await Blog.create(newBlogData);

    // Update blog category
    await BlogCategory.findByIdAndUpdate(
      category,
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

// ********** Read Blog *********
const readBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { identifier } = req.params;

    try {
      let blog;

      if (identifier) {
        // Check if the identifier is a valid MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
          blog = await Blog.findById(identifier).lean();
        } else {
          blog = await Blog.findOne({ slug: identifier }).lean();
        }

        if (!blog) {
          return next(new CustomError(404, "Post not found!"));
        }

        return res.status(200).json(blog);
      } else {
        // If no identifier is provided, return all posts
        const posts = await Blog.find().lean();
        return res.status(200).json(posts);
      }
    } catch (error) {
      return next(error);
    }
  } catch (error) {
    next(error);
  }
};

// ********** Update a blog **********  
const updateBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, params, body } = req;
    const { blogId } = params;
    const { postTitle, slug } = body;

    const updateData = { ...body };

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogs", 2);
    if (!permissionCheck)
      return res.status(403).json({ message: "Permission denied" });

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

    // Determine the slug
    if (!slug) {
      updateData.slug = slugify(postTitle, { lower: true });
    } else {
      const newSlug = slugify(slug, { lower: true });
      const existingBlog = await Blog.findOne({
        slug: newSlug,
        _id: { $ne: blogId },
      });
      if (existingBlog) {
        throw new CustomError(400, "Blog with this slug already exists");
      }
      updateData.slug = newSlug;
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

// ********** Delete Blog **********
const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, params } = req;
    const { blogId } = params;

    // Check permissions
    const permissionCheck = await checkPermission(userId, "blogs", 3);
    if (!permissionCheck)
      return res.status(403).json({ message: "Permission denied" });

    // Check if blog exists and delete it
    const blog = await Blog.findByIdAndDelete(blogId);
    if (!blog) {
      throw new CustomError(404, "Blog not found");
    }

    // Remove blog from its category if a category is assigned
    if (blog.category) {
      await BlogCategory.findByIdAndUpdate(
        blog.category,
        {
          $pull: { blogs: { blogId: blog._id } },
        },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Blog deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export { newBlog, readBlog, updateBlog, deleteBlog };
