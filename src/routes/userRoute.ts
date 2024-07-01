import express, { Router } from "express";
const router: Router = express.Router();
import {
  updateUser,
  getAllUsers,
  getUserById,
  deleteUser,
} from "../controllers/userController";
import verifyToken from "../middlewares/authMiddleware";
import { validateUpdate, validateUserId } from "../helpers/validator";

// Update user route
router.put("/updateUser", verifyToken, validateUpdate, updateUser);

// Get all users route
router.get("/getAllUsers", verifyToken, getAllUsers);

// Get user by id route
router.get("/getUserById", verifyToken, validateUserId, getUserById);

// Delete user route
router.delete("/deleteUserById", verifyToken, validateUserId, deleteUser);

export default router;
