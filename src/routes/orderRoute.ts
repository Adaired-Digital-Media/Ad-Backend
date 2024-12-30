import {
  createOrder,
  stripeWebhook,
  getOrders,
  updateOrder,
  deleteOrder,
  getOrdersByUserId,
} from "../controllers/orderController";
import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";

const router: Router = express.Router();

router.post("/create", verifyToken, createOrder);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);
router.get("/getOrders", verifyToken, getOrders);
router.patch("/updateOrder", verifyToken, updateOrder);
router.delete("/deleteOrder", verifyToken, deleteOrder);
router.get("/getUserOrders", verifyToken, getOrdersByUserId);

export default router;
