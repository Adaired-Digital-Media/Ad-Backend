import express, { Router } from "express";
import {
  syncOrAddToJunkCart,
  updateCart,
  clearCart,
  deleteProduct,
} from "../controllers/junkCartLeadsController";

const router: Router = express.Router();

router.post("/add-product-or-sync-cart", syncOrAddToJunkCart);
router.patch("/update-cart", updateCart);
router.delete("/delete-product", deleteProduct);
router.delete("/clear-cart", clearCart);

export default router;
