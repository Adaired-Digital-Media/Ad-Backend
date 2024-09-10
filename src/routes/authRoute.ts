import express, { Router } from "express";
import { validateLogin, validateRegister } from "../helpers/validator";
import {
  register,
  login,
  logout,
  currentUser,
  refreshToken,
} from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/logout", verifyToken, logout);
router.get("/current-user", verifyToken, currentUser);

export default router;

