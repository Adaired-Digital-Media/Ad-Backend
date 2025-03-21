import express, { Router } from "express";
const router: Router = express.Router();
import { findUser, updateUser, killUser } from "../controllers/userController";
import verifyToken from "../middlewares/authMiddleware";

router.get("/find", verifyToken, findUser);
router.patch("/update", verifyToken, updateUser);
router.delete("/delete", verifyToken, killUser);

export default router;
