import express, { Router } from "express";
import { validateLogin, validateRegister } from "../helpers/validator";
import {
  register,
  login,
  logout,
  currentUser,
  refreshToken,
  resetPassword,
} from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", verifyToken, logout);
router.get("/current-user", verifyToken, currentUser);
router.patch("/reset-password", verifyToken, resetPassword);

export default router;
