import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";
import {
  syncOrAddToCart,
  updateCart,
  getUserCart,
  clearCart,
  deleteProduct,
  getOwnCart,
} from "../controllers/cartController";

const router: Router = express.Router();

router.post("/add-product-or-sync-cart", verifyToken, syncOrAddToCart);
router.get("/get-user-cart", verifyToken, getUserCart);
router.patch("/update-cart", verifyToken, updateCart);
router.delete("/delete-product", verifyToken, deleteProduct);
router.delete("/clear-cart", verifyToken, clearCart);
router.get("/get-own-cart", verifyToken, getOwnCart);

export default router;
