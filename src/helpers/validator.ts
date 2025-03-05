import mongoose from "mongoose";
import { check, body, param } from "express-validator";

// ********** User and Authentication ***********
export const validateRegister = [
  check("name", "Name is required").isString().trim(),
  check("email", "Email is required")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail({
      gmail_remove_dots: true,
    })
    .trim(),
  check("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character"
    )
    .optional(),
  check("contact")
    .isMobilePhone("any")
    .withMessage("Contact must be a valid phone number")
    .optional(),
  check("status").optional(),
];

export const validateLogin = [
  check("email", "Email is required")
    .isEmail()
    .normalizeEmail({
      gmail_remove_dots: true,
    })
    .trim(),
  check("password", "Password is required").notEmpty(),
  check("rememberMe").optional().isBoolean(),
];

// ********** Roles **********
export const validateRole = [
  check("name", "Role name is required").notEmpty().isString().trim(),
  check("description").optional().isString().trim(),
  check("status").optional().isBoolean().default(true),
  check("permissions").isArray().optional(),
];

export const validateUpdateRole = [
  check("name", "Role name is required")
    .optional()
    .notEmpty()
    .isString()
    .trim(),
  check("description").optional().isString().trim(),
  check("status").optional().isBoolean(),
  check("permissions").optional().isArray(),
];

export const validateRoleId = [
  check("roleId", "Role ID is required")
    .optional()
    .notEmpty()
    .isMongoId()
    .withMessage("Please enter a valid role ID"),
];

// *********** Blogs and Blog Categories **********

export const validateBlog = [
  check("metaTitle", "Meta title is required").notEmpty().isString().trim(),
  check("metaDescription", "Meta description is required")
    .notEmpty()
    .isString()
    .trim(),
  check("canonicalLink", "Canonical link is required")
    .notEmpty()
    .isString()
    .trim(),
  check("openGraphImage").optional().isString().trim(),
  check("robotsText", "Robots text is required")
    .notEmpty()
    .isString()
    .trim()
    .custom((value) => {
      if (!value.includes("index") || !value.includes("follow")) {
        throw new Error("Robots text must include 'index' and 'follow'");
      }
      return true;
    }),
  check("category").optional().isMongoId(),
  check("featuredImage", "Featured image is required")
    .notEmpty()
    .isString()
    .trim(),
  check("postTitle", "Post title is required").notEmpty().isString().trim(),
  check("postDescription", "Post description is required")
    .notEmpty()
    .isString()
    .trim(),
  check("slug").optional().isString().trim(),
  check("tags").optional().isString().trim(),
  check("blogAuthor").optional().isMongoId(),
  check("status")
    .optional()
    .isString()
    .isIn(["publish", "draft"])
    .withMessage("Status must be either 'publish' or 'draft'"),
];

export const validateUpdateBlog = [
  check("blogId", "Blog ID is required").notEmpty().isMongoId(),
  check("metaTitle", "Meta title is required").optional().isString().trim(),
  check("metaDescription", "Meta description is required")
    .optional()
    .isString()
    .trim(),
  check("canonicalLink", "Canonical link is required")
    .optional()
    .isString()
    .trim(),
  check("openGraphImage", "Open Graph image is required")
    .optional()
    .isString()
    .trim(),
  check("robotsText", "Robots text is required").optional().isString().trim(),
  check("category", "Category is required").optional().isMongoId(),
  check("featuredImage", "Featured image is required")
    .optional()
    .isString()
    .trim(),
  check("postTitle", "Post title is required").optional().isString().trim(),
  check("postDescription", "Post description is required")
    .optional()
    .isString()
    .trim(),
  check("slug", "Slug is required").optional().isString().trim(),
  check("tags").optional().isString().trim(),
  check("blogAuthor").optional().isMongoId(),
  check("status").optional().isString().isIn(["publish", "draft"]),
];

export const validateBlogCategory = [
  check("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),

  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array"),
  body("subCategories.*.categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),

  check("categoryName", "Category name is required")
    .notEmpty()
    .isString()
    .trim()

    .withMessage("Category name must be a string"),

  check("categorySlug", "Category slug is required")
    .notEmpty()
    .isString()
    .trim()

    .withMessage("Category slug must be a string"),

  check("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be a boolean"),

  check("blogs").optional().isArray().withMessage("Blogs must be an array"),
  body("blogs.*.blogId").optional().isMongoId().withMessage("Invalid blog ID"),
];

export const validateUpdateBlogCategory = [
  check("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID"),
  check("subCategories")
    .optional()
    .isArray()
    .withMessage("Subcategories must be an array"),
  body("subCategories.*.categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid subcategory ID"),
  check("categoryName")
    .notEmpty()
    .optional()
    .isString()
    .trim()

    .withMessage("Category name must be a string"),
  check("categorySlug")
    .notEmpty()
    .optional()
    .isString()
    .trim()

    .withMessage("Category slug must be a string"),
  check("status")
    .optional()
    .isBoolean()
    .withMessage("Status must be a boolean"),
  check("blogs").optional().isArray().withMessage("Blogs must be an array"),
  body("blogs.*.blogId").optional().isMongoId().withMessage("Invalid blog ID"),
];

//  ********** Sevice Pages **********

export const ValidateCreateService = [
  check("metaTitle", "Meta Title is required").isString().trim(),
  check("metaDescription", "Meta Description is required").isString().trim(),
  check("canonicalLink", "Canonical Link is required").isString().trim(),
  check("openGraphImage").optional().isString().trim(),
  check("robotsText").optional().isString().trim(),
  check("focusKeyword", "Focus Keyword is required").isString().trim(),
  check("serviceName", "Service Name is required").isString().trim(),
  check("slug", "Slug is required").isString().trim(),
  check("colorScheme", "Color Scheme is requied").isString().trim(),
  check("parentService").optional().isMongoId(),
  check("status", "Status is required").isIn(["publish", "draft"]),
  check("childServices").optional().isArray(),
  check("childServices.*").isMongoId(),
  check("bodyData").optional().isArray(),
  check("bodyData.*").isObject(),
];

export const ValidateUpdateService = [
  check("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta Title must be a string")
    .notEmpty()
    .withMessage("Meta Title cannot be empty")
    .trim(),
  check("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta Description must be a string")
    .notEmpty()
    .withMessage("Meta Description cannot be empty")
    .trim(),
  check("canonicalLink")
    .optional()
    .isString()
    .withMessage("Canonical Link must be a string")
    .notEmpty()
    .withMessage("Canonical Link cannot be empty")
    .trim(),
  check("openGraphImage")
    .optional()
    .isString()
    .withMessage("Open Graph Image must be a string")
    .trim(),
  check("robotsText")
    .optional()
    .isString()
    .withMessage("Robots Text must be a string")
    .trim(),
  check("focusKeyword")
    .optional()
    .isString()
    .withMessage("Focus Keyword must be a string")
    .notEmpty()
    .withMessage("Focus Keyword cannot be empty")
    .trim(),
  check("serviceName")
    .optional()
    .isString()
    .withMessage("Service Name must be a string")
    .notEmpty()
    .withMessage("Service Name cannot be empty")
    .trim(),
  check("slug")
    .optional()
    .isString()
    .withMessage("Slug must be a string")
    .notEmpty()
    .withMessage("Slug cannot be empty")
    .trim(),
  check("colorScheme", "Color Scheme is required")
    .optional()
    .isString()
    .withMessage("Color Scheme must be a string")
    .notEmpty()
    .withMessage("Color Scheme cannot be empty")
    .trim(),
  check("parentService")
    .optional()
    .isMongoId()
    .withMessage("Parent Service must be a valid Mongo ID"),
  check("status")
    .optional()
    .isIn(["publish", "draft"])
    .withMessage("Status must be either 'publish' or 'draft'"),
  check("childServices")
    .optional()
    .isArray()
    .withMessage("Child Services must be an array"),
  check("childServices.*")
    .optional()
    .isMongoId()
    .withMessage("Each Child Service must be a valid Mongo ID"),
  check("bodyData")
    .optional()
    .isArray()
    .withMessage("Body Data must be an array"),
  check("bodyData.*")
    .optional()
    .isObject()
    .withMessage("Each Body Data entry must be an object"),
];

// ********** Case Studies **********

export const validateCaseStudyCategory = [
  check("categoryName", "Category name is required")
    .notEmpty()
    .isString()
    .trim(),
  check("categorySlug", "Category slug is required")
    .notEmpty()
    .isString()
    .trim(),
  check("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array"),
  check("technologies.*.icon", "Technology icon is required")
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim(),
  check("technologies.*.name", "Technology name is required")
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim(),
  check("caseStudies")
    .optional()
    .isArray()
    .withMessage("Case studies must be an array"),
  check("caseStudies.*.caseStudyId", "Case study ID must be a valid Mongo ID")
    .if(
      (value, { req }) =>
        req.body.caseStudies && req.body.caseStudies.length > 0
    )
    .isMongoId(),
  check("status", "Status must be a boolean").optional().isBoolean(),
];

export const validateCaseStudyUpdateCategory = [
  check("categoryName", "Category name is required")
    .optional()
    .notEmpty()
    .isString()
    .trim(),
  check("categorySlug", "Category slug is required")
    .optional()
    .notEmpty()
    .isString()
    .trim(),
  check("technologies")
    .optional()
    .isArray()
    .withMessage("Technologies must be an array"),
  check("technologies.*.icon", "Technology icon is required")
    .optional()
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim(),
  check("technologies.*.name", "Technology name is required")
    .optional()
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim(),
  check("caseStudies")
    .optional()
    .isArray()
    .withMessage("Case studies must be an array"),
  check("caseStudies.*.caseStudyId", "Case study ID must be a valid Mongo ID")
    .optional()
    .if(
      (value, { req }) =>
        req.body.caseStudies && req.body.caseStudies.length > 0
    )
    .isMongoId(),
  check("status", "Status must be a boolean").optional().isBoolean(),
];

export const validateCaseStudy = [
  check("categoryId", "Category ID is required").notEmpty().isMongoId(),
  check("categorySlug", "Category Slug is required")
    .optional()
    .notEmpty()
    .trim(),
  check("colorScheme", "Color Scheme is required").notEmpty().trim(),
  check("cardImage", "Card Image is required").notEmpty().trim(),
  check("slug", "Slug is required").notEmpty().trim(),
  check("subHeading", "Sub Heading is required").notEmpty().trim(),
  check("caseStudyName", "Case Study Name is required").notEmpty().trim(),
  check("caseStudyDescription", "Case Study Description is required")
    .notEmpty()
    .trim(),
  check("caseStudyImage", "Case Study Image is required").notEmpty().trim(),
  check("aboutProjectDescription", "About Project Description is required")
    .notEmpty()
    .trim(),
  check("challengesImage", "Challenges Image is required").notEmpty().trim(),
  check("challengesDescription", "Challenges Description is required")
    .notEmpty()
    .trim(),
  check("solutionsImage", "Solutions Image is required").notEmpty().trim(),
  check("solutionsDescription", "Solutions Description is required")
    .notEmpty()
    .trim(),
  check(
    "challengesAndSolutions.*.title",
    "Challenge and Solution Title is required"
  )
    .optional()
    .notEmpty()
    .trim(),
  check(
    "challengesAndSolutions.*.content",
    "Challenge and Solution Content is required"
  )
    .optional()
    .notEmpty()
    .trim(),
  check("technologiesUsedTitle", "Technologies Used Title is required")
    .notEmpty()
    .trim(),
  check(
    "technologiesUsedDescription",
    "Technologies Used Description is required"
  )
    .notEmpty()
    .trim(),
  check("technologiesUsed.*.id", "Technology ID is required")
    .optional()
    .notEmpty()
    .isMongoId(),
  check("technologiesUsed.*.icon", "Technology icon url required")
    .optional()
    .notEmpty()
    .isMongoId(),
  check("technologiesUsed.*.name", "Technology name is required")
    .optional()
    .notEmpty()
    .isMongoId(),
  check("goalsTitle", "Goals Title is required").notEmpty().trim(),
  check("goalsDescription", "Goals Description is required").notEmpty().trim(),
  check("objectives.*.title", "Objective Title is required")
    .optional()
    .notEmpty()
    .trim(),
  check("objectives.*.content", "Objective Content is required")
    .optional()
    .notEmpty()
    .trim(),
  check("stratergy.*.title", "Strategy Title is required")
    .optional()
    .notEmpty()
    .trim(),
  check("stratergy.*.content", "Strategy Content is required")
    .optional()
    .notEmpty()
    .trim(),
  check("goalImage", "Goal Image is required").notEmpty().trim(),
  check("growthBox.*.title", "Growth Box Title is required")
    .optional()
    .notEmpty()
    .trim(),
  check("growthBox.*.content", "Growth Box Content is required")
    .optional()
    .notEmpty()
    .trim(),
  check("resultDescription", "Result Description is required")
    .notEmpty()
    .trim(),
  check("resultBox.*.title", "Result Box Title is required")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.percentage", "Result Box Percentage is required")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.description", "Result Box Description is required")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.icon", "Result Box Icon is required")
    .optional()
    .notEmpty()
    .trim(),
  check("resultFinalDescription", "Result Final Description is required")
    .notEmpty()
    .trim(),
];

export const validateUpdateCaseStudy = [
  check("categoryId", "Category ID must be a valid Mongo ID")
    .optional()
    .isMongoId(),
  check("categorySlug", "Category Slug must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("colorScheme", "Color Scheme must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("cardImage", "Card Image must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("slug", "Slug must not be empty").optional().notEmpty().trim(),
  check("subHeading", "Sub Heading must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("caseStudyName", "Case Study Name must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("caseStudyDescription", "Case Study Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("caseStudyImage", "Case Study Image must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check(
    "aboutProjectDescription",
    "About Project Description must not be empty"
  )
    .optional()
    .notEmpty()
    .trim(),
  check("challengesImage", "Challenges Image must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("challengesDescription", "Challenges Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("solutionsImage", "Solutions Image must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("solutionsDescription", "Solutions Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check(
    "challengesAndSolutions.*.title",
    "Challenge and Solution Title must not be empty"
  )
    .optional()
    .notEmpty()
    .trim(),
  check(
    "challengesAndSolutions.*.content",
    "Challenge and Solution Content must not be empty"
  )
    .optional()
    .notEmpty()
    .trim(),
  check("technologiesUsedTitle", "Technologies Used Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check(
    "technologiesUsedDescription",
    "Technologies Used Description must not be empty"
  )
    .optional()
    .notEmpty()
    .trim(),
  check("technologiesUsed.*.id", "Technology ID must be a valid Mongo ID")
    .optional()
    .isMongoId(),
  check("technologiesUsed.*.icon", "Technology icon URL must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("technologiesUsed.*.name", "Technology name must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("goalsTitle", "Goals Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("goalsDescription", "Goals Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("objectives.*.title", "Objective Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("objectives.*.content", "Objective Content must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("stratergy.*.title", "Strategy Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("stratergy.*.content", "Strategy Content must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("goalImage", "Goal Image must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("growthBox.*.title", "Growth Box Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("growthBox.*.content", "Growth Box Content must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultDescription", "Result Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.title", "Result Box Title must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.percentage", "Result Box Percentage must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.description", "Result Box Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultBox.*.icon", "Result Box Icon must not be empty")
    .optional()
    .notEmpty()
    .trim(),
  check("resultFinalDescription", "Result Final Description must not be empty")
    .optional()
    .notEmpty()
    .trim(),
];

// ************** Products *********************
export const validateCreateProduct = [
  check("featuredImage")
    .isString()
    .withMessage("Featured image URL is required")
    .notEmpty()
    .withMessage("Featured image URL should not be empty"),

  check("name")
    .isString()
    .withMessage("Product name is required")
    .notEmpty()
    .withMessage("Product name should not be empty"),

  check("description")
    .isString()
    .withMessage("Description is required")
    .optional(),

  check("category")
    .isMongoId()
    .withMessage("Invalid category ID format")
    .notEmpty()
    .withMessage("Category is required"),

  check("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subCategory ID format")
    .notEmpty()
    .withMessage("Sub-Category is required"),

  check("slug")
    .optional()
    .isString()
    .withMessage("Slug should be a string")
    .isLength({ max: 100 })
    .withMessage("Slug should not exceed 100 characters"),

  check("pricePerUnit")
    .isNumeric()
    .withMessage("Price must be a number")
    .notEmpty()
    .withMessage("Price is required")
    .custom((value) => value >= 0)
    .withMessage("Price must be greater than or equal to 0"),

  check("pricingType")
    .optional()
    .isIn(["perWord", "perPost", "perReview", "perMonth", "perQuantity"])
    .withMessage(
      "Pricing type must be one of 'perWord', 'perPost', 'perReview', 'perMonth' or 'perQuantity'"
    ),

  check("stock")
    .optional()
    .isNumeric()
    .isInt()
    .withMessage("Stock must be an integer")
    .custom((value) => value >= 0)
    .withMessage("Stock must be greater than or equal to 0"),

  check("images")
    .optional()
    .isArray()
    .withMessage("Images should be an array of strings"),

  check("tags")
    .optional()
    .isArray()
    .withMessage("Tags should be an array of strings"),

  check("priority")
    .optional()
    .isInt()
    .withMessage("Priority must be an integer"),

  check("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords should be an array of strings"),

  check("formId").optional().isMongoId().withMessage("Invalid form ID format"),

  check("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title should be a string"),

  check("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description should be a string"),

  check("canonicalLink")
    .optional()
    .isString()
    .withMessage("Canonical link should be a string"),

  check("status")
    .optional()
    .isIn(["Active", "Inactive", "Archived", "Out of Stock"])
    .withMessage(
      "Status must be one of Active, Inactive, Archived, or Out of Stock"
    ),

  check("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),
];

export const validateUpdateProduct = [
  check("featuredImage")
    .optional()
    .isString()
    .withMessage("Featured image URL must be a string")
    .notEmpty()
    .withMessage("Featured image URL should not be empty"),

  check("name")
    .optional()
    .isString()
    .withMessage("Product name must be a string")
    .notEmpty()
    .withMessage("Product name should not be empty"),

  check("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description should not be empty"),

  check("userId").optional().isMongoId().withMessage("Invalid user ID format"),

  check("formId").optional().isMongoId().withMessage("Invalid form ID format"),

  check("category")
    .optional()
    .isMongoId()
    .withMessage("Invalid category ID format"),

  check("subCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid subCategory ID format"),

  check("slug")
    .optional()
    .isString()
    .withMessage("Slug should be a string")
    .isLength({ max: 100 })
    .withMessage("Slug should not exceed 100 characters"),

  check("price")
    .optional()
    .isNumeric()
    .withMessage("Price must be a number")
    .custom((value) => value >= 0)
    .withMessage("Price must be greater than or equal to 0"),

  check("quantity")
    .optional()
    .isNumeric()
    .withMessage("Quantity unit must be a number"),

  check("pricingType")
    .optional()
    .isIn(["perWord", "perPost", "perReview", "perMonth", "perQuantity"])
    .withMessage(
      "Pricing type must be one of 'perWord', 'perPost', 'perReview', 'perMonth' or 'perQuantity'"
    ),

  check("stock")
    .optional()
    .isInt()
    .withMessage("Stock must be an integer")
    .custom((value) => value >= 0)
    .withMessage("Stock must be greater than or equal to 0"),

  check("images")
    .optional()
    .isArray()
    .withMessage("Images should be an array of strings"),

  check("tags")
    .optional()
    .isArray()
    .withMessage("Tags should be an array of strings"),

  check("priority")
    .optional()
    .isInt()
    .withMessage("Priority must be an integer"),

  check("keywords")
    .optional()
    .isArray()
    .withMessage("Keywords should be an array of strings"),

  check("status")
    .optional()
    .isIn(["Active", "Inactive", "Archived", "Out of Stock"])
    .withMessage(
      "Status must be one of Active, Inactive, Archived, or Out of Stock"
    ),

  check("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),
];

export const validateProductCreateCategory = [
  check("name")
    .isString()
    .withMessage("Category name is required")
    .notEmpty()
    .withMessage("Category name should not be empty"),

  check("description")
    .optional()
    .isString()
    .withMessage("Description should be a string"),

  check("parentCategory")
    .optional({ values: "null" })
    .isMongoId()
    .withMessage("Invalid parent category ID format"),

  check("children")
    .optional()
    .isArray()
    .withMessage("Children should be an array of category IDs")
    .custom((value) =>
      value.every((v: any) => mongoose.Types.ObjectId.isValid(v))
    )
    .withMessage("Each child category ID should be a valid ObjectId"),

  check("products")
    .optional()
    .isArray()
    .withMessage("Products should be an array of product IDs")
    .custom((value) =>
      value.every((v: any) => mongoose.Types.ObjectId.isValid(v))
    )
    .withMessage("Each product ID should be a valid ObjectId"),

  check("slug")
    .optional()
    .isString()
    .withMessage("Slug should be a string")
    .isLength({ max: 100 })
    .withMessage("Slug should not exceed 100 characters"),

  check("image")
    .optional()
    .isString()
    .withMessage("Image URL should be a string"),

  check("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title should be a string"),

  check("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description should be a string"),

  check("canonicalLink")
    .optional()
    .isString()
    .withMessage("Canonical link should be a string"),

  check("status")
    .optional()
    .isIn(["Active", "Inactive", "Draft"])
    .withMessage("Status must be one of 'Active', 'Inactive', or 'Draft'"),

  check("createdBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),

  check("updatedBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
];

export const validateProductUpdateCategory = [
  check("name")
    .optional()
    .isString()
    .withMessage("Category name is required")
    .notEmpty()
    .withMessage("Category name should not be empty"),

  check("description")
    .optional()
    .isString()
    .withMessage("Description should be a string"),

  check("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent category ID format"),

  check("children")
    .optional()
    .isArray()
    .withMessage("Children should be an array of category IDs")
    .custom((value) =>
      value.every((v: any) => mongoose.Types.ObjectId.isValid(v))
    )
    .withMessage("Each child category ID should be a valid ObjectId"),

  check("products")
    .optional()
    .isArray()
    .withMessage("Products should be an array of product IDs")
    .custom((value) =>
      value.every((v: any) => mongoose.Types.ObjectId.isValid(v))
    )
    .withMessage("Each product ID should be a valid ObjectId"),

  check("slug")
    .optional()
    .isString()
    .withMessage("Slug should be a string")
    .isLength({ max: 100 })
    .withMessage("Slug should not exceed 100 characters"),

  check("image")
    .optional()
    .isString()
    .withMessage("Image URL should be a string"),

  check("metaTitle")
    .optional()
    .isString()
    .withMessage("Meta title should be a string"),

  check("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta description should be a string"),

  check("canonicalLink")
    .optional()
    .isString()
    .withMessage("Canonical link should be a string"),

  check("status")
    .optional()
    .isIn(["Active", "Inactive", "Draft"])
    .withMessage("Status must be one of 'Active', 'Inactive', or 'Draft'"),

  check("createdBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),

  check("updatedBy")
    .optional()
    .isMongoId()
    .withMessage("Invalid user ID format"),
];
