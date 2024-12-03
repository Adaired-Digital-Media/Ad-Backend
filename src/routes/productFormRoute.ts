import express, { Router } from "express";
import {
  createForm,
  readForm,
  updateForm,
  deleteForm,
} from "../controllers/productFormController";
import verifyToken from "../middlewares/authMiddleware";

const router: Router = express.Router();

router.post("/create-form", verifyToken, createForm);
router.get("/read-form", readForm);
router.patch("/update-form", verifyToken, updateForm);
router.delete("/delete-form", verifyToken, deleteForm);

export default router;
