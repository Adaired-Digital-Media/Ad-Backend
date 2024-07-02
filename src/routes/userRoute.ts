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
router.put("/updateUser/:userId", verifyToken, validateUpdate, updateUser);

// Get user by id route
router.get("/getUserById/:userId", verifyToken, validateUserId, getUserById);

// Delete user route
router.delete("/deleteUserById/:userId", verifyToken, validateUserId, deleteUser);

// Get all users route
router.get("/getAllUsers", verifyToken, getAllUsers);


export default router;
