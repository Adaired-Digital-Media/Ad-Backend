import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  stripeWebhook
} from "../controllers/orderController";
import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";


const router: Router = express.Router();

router.post("/create", verifyToken, createOrder);
router.get("/", verifyToken, getOrders);
router.get("/:orderId", verifyToken, getOrderById);
router.put("/:orderId", verifyToken, updateOrderStatus);
router.delete("/:orderId", verifyToken, deleteOrder);

// Add the webhook route
router.post("/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);
export default router;
