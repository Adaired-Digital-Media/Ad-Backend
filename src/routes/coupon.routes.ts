import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";
import { createCoupon } from "../controllers/coupon.controller";

const router: Router = express.Router();

router.post("/create", verifyToken, createCoupon);

export default router;
