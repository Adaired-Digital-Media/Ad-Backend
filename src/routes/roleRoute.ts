import express, { Router } from "express";
import {
  validateRole,
  validateUpdateRole,
  validateRoleId,
} from "../helpers/validator";
import {
  newRole,
  updateRole,
  findRoles,
  deleteRole,
} from "../controllers/roleController";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/createNewRole", verifyToken, validateRole, newRole);
router.put("/editRole", verifyToken, validateUpdateRole, updateRole);
router.get("/findRoles", verifyToken, validateRoleId, findRoles);
router.delete("/deleteRole", verifyToken, validateRoleId, deleteRole);

export default router;
