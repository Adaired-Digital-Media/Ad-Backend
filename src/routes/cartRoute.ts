import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";
import {
  syncOrAddToCart,
  updateCart,
  getUserCart,
  clearCart,
  deleteProduct,
} from "../controllers/cartController";

const router: Router = express.Router();

router.post("/add-product-or-sync-cart", verifyToken, syncOrAddToCart);
router.get("/get-user-cart", verifyToken, getUserCart);
router.patch("/update-cart", verifyToken, updateCart);
router.delete("/delete-product", verifyToken, deleteProduct);
router.delete("/clear-cart", verifyToken, clearCart);

export default router;
