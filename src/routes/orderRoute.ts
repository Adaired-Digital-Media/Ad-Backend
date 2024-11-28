import express, { Router } from "express";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

export default router;
