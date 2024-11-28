import express, { Router } from "express";
import {
  createCategory,
  deleteCategory,
  duplicateCategory,
  readCategories,
  updateCategory,
} from "../controllers/productCategoryController";
import verifyToken from "../middlewares/authMiddleware";
import {
  validateProductCreateCategory,
  validateProductUpdateCategory,
} from "../helpers/validator";

const router: Router = express.Router();

router.post(
  "/create-category",
  verifyToken,
  validateProductCreateCategory,
  createCategory
);
router.get("/read-category/:identifier?", readCategories);
router.patch(
  "/update-category/:identifier",
  verifyToken,
  validateProductUpdateCategory,
  updateCategory
);
router.delete("/delete-category/:identifier", verifyToken, deleteCategory);
router.post("/duplicate-category/:identifier", verifyToken, duplicateCategory);

export default router;
