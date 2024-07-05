import express, { Router } from "express";
import { validateRole, validateUpdateRole } from "../helpers/validator";
import {
  newRole,
  updateRole,
  findRoles,
  deleteRole,
} from "../controllers/roleController";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/createNewRole", verifyToken, validateRole, newRole);
router.get("/readRoles/:roleId?", findRoles);
router.put("/updateRole/:roleId", verifyToken, validateUpdateRole, updateRole);
router.delete("/deleteRole/:roleId?", verifyToken, deleteRole);

export default router;
