import mongoose, { Schema } from "mongoose";
import { BlogTypes } from "../types/blogTypes";

const blogSchema = new Schema(
  {
    metaTitle: {
      type: String,
      required: true,
    },
    metaDescription: {
      type: String,
      required: true,
    },
    canonicalLink: {
      type: String,
      required: true,
    },
    openGraphImage: {
      type: String,
      required: true,
    },
    robotsText: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "BlogCategory",
      default: null,
    },
    featuredImage: {
      type: String,
      required: true,
    },
    postTitle: {
      type: String,
      required: true,
    },
    postDescription: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
    },
    blogAuthor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["publish", "draft"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model<BlogTypes>("Blog", blogSchema);

export default Blog;

// // ********** Delete Blog **********
// const deleteBlog = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { userId, params } = req;
//     const { blogId } = params;

//     // Check permissions
//     const permissionCheck = await checkPermission(userId, "blogs", 3);
//     if (!permissionCheck) return res.status(403).json({ message: "Permission denied" });

//     // Check if blog exists and delete it
//     const blog = await Blog.findByIdAndDelete(blogId);
//     if (!blog) {
//       throw new CustomError(404, "Blog not found");
//     }

//     // Remove blog from its category if a category is assigned
//     if (blog.category) {
//       await BlogCategory.findByIdAndUpdate(
//         blog.category,
//         {
//           $pull: { blogs: blog._id },
//         },
//         { new: true }
//       );
//     }

//     res.status(200).json({
//       message: "Blog deleted successfully",
//     });
//   } catch (error) {
//     next(error);
//   }
// };
