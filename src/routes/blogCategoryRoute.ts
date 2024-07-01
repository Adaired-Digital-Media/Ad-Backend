import { newBlogCategory } from "../controllers/blogCategoryController";
import express, { Router } from "express";
import { validateBlogCategory } from "../helpers/validator";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post(
  "/createNewBlogCategory",
  verifyToken,
  validateBlogCategory,
  newBlogCategory
);

export default router;
