import express, { Router } from "express";
import {
  createProduct,
  readProducts,
  updateProduct,
  deleteProduct,
  duplicateProduct,
} from "../controllers/productController";
import verifyToken from "../middlewares/authMiddleware";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "../helpers/validator";

const router: Router = express.Router();

router.post(
  "/create-product",
  verifyToken,
  validateCreateProduct,
  createProduct
);
router.patch(
  "/update-product/:identifier",
  verifyToken,
  validateUpdateProduct,
  updateProduct
);
router.get("/read-product/:identifier?", readProducts);
router.delete("/delete-product/:identifier", verifyToken, deleteProduct);
router.post("/duplicate-product/:identifier", verifyToken, duplicateProduct);

export default router;
