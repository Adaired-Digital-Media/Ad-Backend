"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBlogCategory = exports.validateUpdateBlog = exports.validateBlog = exports.validateRoleId = exports.validateUpdateRole = exports.validateRole = exports.validateUserId = exports.validateUpdate = exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.check)("name", "Name is required").notEmpty().isString().trim().escape(),
    (0, express_validator_1.check)("email", "Email is required")
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail({
        gmail_remove_dots: true,
    })
        .trim()
        .escape(),
    (0, express_validator_1.check)("password", "Password is required")
        .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
        .withMessage("Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"),
    (0, express_validator_1.check)("contact", "Contact is required")
        .notEmpty()
        .isMobilePhone("any")
        .withMessage("Contact must be a valid phone number"),
];
exports.validateLogin = [
    (0, express_validator_1.check)("email", "Email is required")
        .isEmail()
        .normalizeEmail({
        gmail_remove_dots: true,
    })
        .trim()
        .escape(),
    (0, express_validator_1.check)("password", "Password is required").notEmpty(),
    (0, express_validator_1.check)("rememberMe", "Remember is required").isBoolean(),
];
exports.validateUpdate = [
    (0, express_validator_1.check)("userId", "User ID is required"),
    (0, express_validator_1.check)("name", "Name is required").optional().isString().trim().escape(),
    (0, express_validator_1.check)("email", "Email is required")
        .optional()
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail({
        gmail_remove_dots: true,
    })
        .trim()
        .escape(),
    (0, express_validator_1.check)("password", "Password is required")
        .optional()
        .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
        .withMessage("Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"),
    (0, express_validator_1.check)("contact", "Contact is required")
        .optional()
        .isMobilePhone("any")
        .withMessage("Contact must be a valid phone number"),
];
exports.validateUserId = [
    (0, express_validator_1.check)("userId", "User ID is required")
        .notEmpty()
        .isMongoId()
        .withMessage("Please enter a valid user ID"),
];
// Roles
exports.validateRole = [
    (0, express_validator_1.check)("roleName", "Role name is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("roleDescription", "Role description is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("roleStatus", "Role status is required").notEmpty().isBoolean(),
    (0, express_validator_1.check)("rolePermissions", "Role permissions are required")
        .notEmpty()
        .isArray(),
];
exports.validateUpdateRole = [
    (0, express_validator_1.check)("roleId", "Role ID is required")
        .optional()
        .notEmpty()
        .isMongoId()
        .withMessage("Please enter a valid role ID"),
    (0, express_validator_1.check)("roleName", "Role name is required")
        .optional()
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("roleDescription", "Role description is required")
        .optional()
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("roleStatus", "Role status is required")
        .optional()
        .notEmpty()
        .isBoolean(),
    (0, express_validator_1.check)("rolePermissions", "Role permissions are required")
        .optional()
        .notEmpty()
        .isArray(),
];
exports.validateRoleId = [
    (0, express_validator_1.check)("roleId", "Role ID is required")
        .optional()
        .notEmpty()
        .isMongoId()
        .withMessage("Please enter a valid role ID"),
];
// Blogs and Blog Categories
exports.validateBlog = [
    (0, express_validator_1.check)("blogMetaTitle", "Meta title is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogMetaDescription", "Meta description is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogOGImage", "OG image is required").notEmpty().isString().trim(),
    (0, express_validator_1.check)("blogCategory", "Category is required").notEmpty().isMongoId(),
    (0, express_validator_1.check)("blogImage", "Image is required").notEmpty().isString().trim(),
    (0, express_validator_1.check)("blogImageAlt", "Image alt is required").notEmpty().isString().trim(),
    (0, express_validator_1.check)("blogTitle", "Title is required").notEmpty().isString().trim().escape(),
    (0, express_validator_1.check)("blogContent", "Content is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogTags").optional().isArray(),
    (0, express_validator_1.check)("blogSlug", "Slug is required").notEmpty().isString().trim().escape(),
    (0, express_validator_1.check)("blogAuthor").optional().isMongoId(),
];
exports.validateUpdateBlog = [
    (0, express_validator_1.check)("blogId", "Blog ID is required").notEmpty().isMongoId(),
    (0, express_validator_1.check)("blogMetaTitle", "Meta title is required")
        .optional()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogMetaDescription", "Meta description is required")
        .optional()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogOGImage", "OG image is required").optional().isString().trim(),
    (0, express_validator_1.check)("blogCategory", "Category is required").optional().isMongoId(),
    (0, express_validator_1.check)("blogImage", "Image is required").optional().isString().trim(),
    (0, express_validator_1.check)("blogImageAlt", "Image alt is required").optional().isString().trim(),
    (0, express_validator_1.check)("blogTitle", "Title is required").optional().isString().trim().escape(),
    (0, express_validator_1.check)("blogContent", "Content is required")
        .optional()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("blogTags").optional().isArray(),
    (0, express_validator_1.check)("blogSlug", "Slug is required").optional().isString().trim().escape(),
    (0, express_validator_1.check)("blogAuthor").optional().isMongoId(),
];
exports.validateBlogCategory = [
    (0, express_validator_1.check)("isSubCategory").optional().isBoolean(),
    (0, express_validator_1.check)("parentCategory").if((0, express_validator_1.check)("isSubCategory").equals("true")).isMongoId(),
    (0, express_validator_1.check)("subCategories").if((0, express_validator_1.check)("isSubCategory").equals("false")).isArray(),
    (0, express_validator_1.check)("categoryName", "Category name is required")
        .notEmpty()
        .isString()
        .trim()
        .escape(),
    (0, express_validator_1.check)("categorySlug").optional().isString().trim().escape(),
    (0, express_validator_1.check)("status", "Status is required").optional().isBoolean(),
    (0, express_validator_1.check)("blogs").optional().isArray(),
];
