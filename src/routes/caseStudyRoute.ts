import {
  validateCaseStudy,
  validateUpdateCaseStudy,
} from "../helpers/validator";
import {
  createCaseStudy,
  readCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from "../controllers/caseStudyController";
import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

// Route to create a new case study
router.post(
  "/createCaseStudy",
  verifyToken,
  validateCaseStudy,
  createCaseStudy
);

// Route to read all case studies
router.get("/readCaseStudies/:identifier?", readCaseStudy);

// Route to update an existing case study
router.put(
  "/updateCaseStudy/:caseStudyId",
  verifyToken,
  validateUpdateCaseStudy,
  updateCaseStudy
);

// Route to delete a case study
router.delete("/deleteCaseStudy/:caseStudyId", verifyToken, deleteCaseStudy);

export default router;
