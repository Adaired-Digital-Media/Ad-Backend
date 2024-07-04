import { check, body } from "express-validator";

// ********** User and Authentication ***********
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
  check("rememberMe").optional().isBoolean(),
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

// ********** Roles **********
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

// *********** Blogs and Blog Categories **********

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
  check("blogStatus").optional().isString(),
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
    .escape()
    .withMessage("Category name must be a string"),

  check("categorySlug", "Category slug is required")
    .notEmpty()
    .isString()
    .trim()
    .escape()
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
    .escape()
    .withMessage("Category name must be a string"),
  check("categorySlug")
    .notEmpty()
    .optional()
    .isString()
    .trim()
    .escape()
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
  check("metaTitle", "Meta Title is required").isString().trim().escape(),
  check("metaDescription", "Meta Description is required")
    .isString()
    .trim()
    .escape(),
  check("canonicalLink", "Canonical Link is required")
    .isString()
    .trim()
    .escape(),
  check("openGraphImage").optional().isString().trim().escape(),
  check("robotsText").optional().isString().trim().escape(),
  check("focusKeyword", "Focus Keyword is required").isString().trim().escape(),
  check("serviceName", "Service Name is required").isString().trim().escape(),
  check("slug", "Slug is required").isString().trim().escape(),
  check("colorScheme", "Color Scheme is requied").isString().trim().escape(),
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
    .trim()
    .escape(),
  check("metaDescription")
    .optional()
    .isString()
    .withMessage("Meta Description must be a string")
    .notEmpty()
    .withMessage("Meta Description cannot be empty")
    .trim()
    .escape(),
  check("canonicalLink")
    .optional()
    .isString()
    .withMessage("Canonical Link must be a string")
    .notEmpty()
    .withMessage("Canonical Link cannot be empty")
    .trim()
    .escape(),
  check("openGraphImage")
    .optional()
    .isString()
    .withMessage("Open Graph Image must be a string")
    .trim()
    .escape(),
  check("robotsText")
    .optional()
    .isString()
    .withMessage("Robots Text must be a string")
    .trim()
    .escape(),
  check("focusKeyword")
    .optional()
    .isString()
    .withMessage("Focus Keyword must be a string")
    .notEmpty()
    .withMessage("Focus Keyword cannot be empty")
    .trim()
    .escape(),
  check("serviceName")
    .optional()
    .isString()
    .withMessage("Service Name must be a string")
    .notEmpty()
    .withMessage("Service Name cannot be empty")
    .trim()
    .escape(),
  check("slug")
    .optional()
    .isString()
    .withMessage("Slug must be a string")
    .notEmpty()
    .withMessage("Slug cannot be empty")
    .trim()
    .escape(),
  check("colorScheme", "Color Scheme is required")
    .optional()
    .isString()
    .withMessage("Color Scheme must be a string")
    .notEmpty()
    .withMessage("Color Scheme cannot be empty")
    .trim()
    .escape(),
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
    .trim()
    .escape(),
  check("categorySlug", "Category slug is required")
    .notEmpty()
    .isString()
    .trim()
    .escape(),
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
    .trim()
    .escape(),
  check("technologies.*.name", "Technology name is required")
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim()
    .escape(),
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
    .trim()
    .escape(),
  check("categorySlug", "Category slug is required")
    .optional()
    .notEmpty()
    .isString()
    .trim()
    .escape(),
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
    .trim()
    .escape(),
  check("technologies.*.name", "Technology name is required")
    .optional()
    .if(
      (value, { req }) =>
        req.body.technologies && req.body.technologies.length > 0
    )
    .notEmpty()
    .isString()
    .trim()
    .escape(),
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
    .trim()
    .escape(),
  check("colorScheme", "Color Scheme is required").notEmpty().trim().escape(),
  check("cardImage", "Card Image is required").notEmpty().trim().escape(),
  check("slug", "Slug is required").notEmpty().trim().escape(),
  check("subHeading", "Sub Heading is required").notEmpty().trim().escape(),
  check("caseStudyName", "Case Study Name is required")
    .notEmpty()
    .trim()
    .escape(),
  check("caseStudyDescription", "Case Study Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check("caseStudyImage", "Case Study Image is required")
    .notEmpty()
    .trim()
    .escape(),
  check("aboutProjectDescription", "About Project Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check("challengesImage", "Challenges Image is required")
    .notEmpty()
    .trim()
    .escape(),
  check("challengesDescription", "Challenges Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check("solutionsImage", "Solutions Image is required")
    .notEmpty()
    .trim()
    .escape(),
  check("solutionsDescription", "Solutions Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check(
    "challengesAndSolutions.*.title",
    "Challenge and Solution Title is required"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check(
    "challengesAndSolutions.*.content",
    "Challenge and Solution Content is required"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("technologiesUsedTitle", "Technologies Used Title is required")
    .notEmpty()
    .trim()
    .escape(),
  check(
    "technologiesUsedDescription",
    "Technologies Used Description is required"
  )
    .notEmpty()
    .trim()
    .escape(),
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
  check("goalsTitle", "Goals Title is required").notEmpty().trim().escape(),
  check("goalsDescription", "Goals Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check("objectives.*.title", "Objective Title is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("objectives.*.content", "Objective Content is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("stratergy.*.title", "Strategy Title is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("stratergy.*.content", "Strategy Content is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("goalImage", "Goal Image is required").notEmpty().trim().escape(),
  check("growthBox.*.title", "Growth Box Title is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("growthBox.*.content", "Growth Box Content is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultDescription", "Result Description is required")
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.title", "Result Box Title is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.percentage", "Result Box Percentage is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.description", "Result Box Description is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.icon", "Result Box Icon is required")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultFinalDescription", "Result Final Description is required")
    .notEmpty()
    .trim()
    .escape(),
];

export const validateUpdateCaseStudy = [
  check("categoryId", "Category ID must be a valid Mongo ID")
    .optional()
    .isMongoId(),
  check("categorySlug", "Category Slug must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("colorScheme", "Color Scheme must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("cardImage", "Card Image must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("slug", "Slug must not be empty").optional().notEmpty().trim().escape(),
  check("subHeading", "Sub Heading must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("caseStudyName", "Case Study Name must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("caseStudyDescription", "Case Study Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("caseStudyImage", "Case Study Image must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check(
    "aboutProjectDescription",
    "About Project Description must not be empty"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("challengesImage", "Challenges Image must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("challengesDescription", "Challenges Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("solutionsImage", "Solutions Image must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("solutionsDescription", "Solutions Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check(
    "challengesAndSolutions.*.title",
    "Challenge and Solution Title must not be empty"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check(
    "challengesAndSolutions.*.content",
    "Challenge and Solution Content must not be empty"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("technologiesUsedTitle", "Technologies Used Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check(
    "technologiesUsedDescription",
    "Technologies Used Description must not be empty"
  )
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("technologiesUsed.*.id", "Technology ID must be a valid Mongo ID")
    .optional()
    .isMongoId(),
  check("technologiesUsed.*.icon", "Technology icon URL must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("technologiesUsed.*.name", "Technology name must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("goalsTitle", "Goals Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("goalsDescription", "Goals Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("objectives.*.title", "Objective Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("objectives.*.content", "Objective Content must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("stratergy.*.title", "Strategy Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("stratergy.*.content", "Strategy Content must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("goalImage", "Goal Image must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("growthBox.*.title", "Growth Box Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("growthBox.*.content", "Growth Box Content must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultDescription", "Result Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.title", "Result Box Title must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.percentage", "Result Box Percentage must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.description", "Result Box Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultBox.*.icon", "Result Box Icon must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
  check("resultFinalDescription", "Result Final Description must not be empty")
    .optional()
    .notEmpty()
    .trim()
    .escape(),
];
