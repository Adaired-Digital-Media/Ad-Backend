import express, { Router } from "express";
import {
  createService,
  deleteService,
  readServices,
  updateService,
} from "../controllers/serviceController";
import verifyToken from "../middlewares/authMiddleware";
import {
  ValidateCreateService,
  ValidateUpdateService,
} from "../helpers/validator";

const router: Router = express.Router();

router.post(
  "/createService",
  verifyToken,
  ValidateCreateService,
  createService
);
router.get("/getServices/:identifier", readServices);
router.get("/getServices", readServices);
router.put(
  "/updateService/:id",
  verifyToken,
  ValidateUpdateService,
  updateService
);
router.delete("/deleteService/:id", verifyToken, deleteService);

export default router;
