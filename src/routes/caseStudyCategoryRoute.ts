import {
  validateCaseStudyCategory,
  validateCaseStudyUpdateCategory,
} from "./../helpers/validator";
import {
  newCaseStudyCategory,
  readCaseStudyCategories,
  updateCaseStudyCategory,
  deleteCaseStudyCategory,
} from "../controllers/caseStudyCategoryController";
import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";

const router: Router = express.Router();

// Route to create a new case study category
router.post(
  "/createCategory",
  verifyToken,
  validateCaseStudyCategory,
  newCaseStudyCategory
);

// Route to read case study categories
router.get(
  "/readCategories/:categoryId?",
  verifyToken,
  readCaseStudyCategories
);

// Route to update a case study category
router.put(
  "/updateCategory/:categoryId",
  verifyToken,
  validateCaseStudyUpdateCategory,
  updateCaseStudyCategory
);

// Route to delete a case study category
router.delete(
  "/deleteCategory/:categoryId",
  verifyToken,
  deleteCaseStudyCategory
);

export default router;
