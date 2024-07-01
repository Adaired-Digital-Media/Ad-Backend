import express, { Router } from "express";
import { validateLogin, validateRegister } from "../helpers/validator";
import {
  register,
  login,
  logout,
  currentUser,
} from "../controllers/authController";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

// Register route
router.post("/register", validateRegister, register);

// Login route
router.post("/login", validateLogin, login);

// Logout route
router.get("/logout", verifyToken, logout);

// Current User route
router.get("/refetch", verifyToken, currentUser);

export default router;
