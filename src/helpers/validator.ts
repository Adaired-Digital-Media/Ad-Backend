import { check } from "express-validator";

export const validateRegister = [
  check("name", "Name is required").notEmpty().isString().trim().escape(),
  check("email", "Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail({
      gmail_remove_dots: true,
    })
    .trim()
    .escape(),
  check("password", "Password is required")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
    ),
  check("contact", "Contact is required")
    .notEmpty()
    .isMobilePhone("any")
    .withMessage("Contact must be a valid phone number"),
];

export const validateLogin = [
  check("email", "Email is required")
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: true,
    })
    .trim()
    .escape(),
  check("password", "Password is required").notEmpty(),
  check("rememberMe", "Remember is required").isBoolean(),
];

export const validateUpdate = [
  check("userId", "User ID is required"),
  check("name", "Name is required").optional().isString().trim().escape(),
  check("email", "Email is required")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail({
      gmail_remove_dots: true,
    })
    .trim()
    .escape(),
  check("password", "Password is required")
    .optional()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
    ),
  check("contact", "Contact is required")
    .optional()
    .isMobilePhone("any")
    .withMessage("Contact must be a valid phone number"),
];

export const validateUserId = [
  check("userId", "User ID is required")
    .notEmpty()
    .isMongoId()
    .withMessage("Please enter a valid user ID"),
];

// Roles
export const validateRole = [
  check("roleName", "Role name is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("roleDescription", "Role description is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("roleStatus", "Role status is required").notEmpty().isBoolean(),
  check("rolePermissions", "Role permissions are required")
    .notEmpty()
    .isArray(),
];

export const validateUpdateRole = [
  check("roleId", "Role ID is required")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Please enter a valid role ID"),
  check("roleName", "Role name is required")
    .optional()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("roleDescription", "Role description is required")
    .optional()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("roleStatus", "Role status is required")
    .optional()
    .notEmpty()
    .isBoolean(),
  check("rolePermissions", "Role permissions are required")
    .optional()
    .notEmpty()
    .isArray(),
];

export const validateRoleId = [
  check("roleId", "Role ID is required")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Please enter a valid role ID"),
];

// Blogs and Blog Categories

export const validateBlog = [
  check("blogMetaTitle", "Meta title is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("blogMetaDescription", "Meta description is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("blogOGImage", "OG image is required").notEmpty().isString().trim(),
  check("blogCategory", "Category is required").notEmpty().isMongoId(),
  check("blogImage", "Image is required").notEmpty().isString().trim(),
  check("blogImageAlt", "Image alt is required").notEmpty().isString().trim(),
  check("blogTitle", "Title is required").notEmpty().isString().trim().escape(),
  check("blogContent", "Content is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("blogTags").optional().isArray(),
  check("blogSlug", "Slug is required").notEmpty().isString().trim().escape(),
  check("blogAuthor").optional().isMongoId(),
];

export const validateUpdateBlog = [
  check("blogId", "Blog ID is required").notEmpty().isMongoId(),
  check("blogMetaTitle", "Meta title is required")
    .optional()
    .isString()
    .trim()
    .escape(),
  check("blogMetaDescription", "Meta description is required")
    .optional()
    .isString()
    .trim()
    .escape(),
  check("blogOGImage", "OG image is required").optional().isString().trim(),
  check("blogCategory", "Category is required").optional().isMongoId(),
  check("blogImage", "Image is required").optional().isString().trim(),
  check("blogImageAlt", "Image alt is required").optional().isString().trim(),
  check("blogTitle", "Title is required").optional().isString().trim().escape(),
  check("blogContent", "Content is required")
    .optional()
    .isString()
    .trim()
    .escape(),
  check("blogTags").optional().isArray(),
  check("blogSlug", "Slug is required").optional().isString().trim().escape(),
  check("blogAuthor").optional().isMongoId(),
];

export const validateBlogCategory = [
  check("isSubCategory").optional().isBoolean(),
  check("parentCategory").if(check("isSubCategory").equals("true")).isMongoId(),
  check("subCategories").if(check("isSubCategory").equals("false")).isArray(),
  check("categoryName", "Category name is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
  check("categorySlug").optional().isString().trim().escape(),
  check("status", "Status is required").optional().isBoolean(),
  check("blogs").optional().isArray(),
];
