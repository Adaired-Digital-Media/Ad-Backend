import express, { Router } from "express";
import { newPage, findPages } from "../controllers/pageController";

const router: Router = express.Router();

router.post("/newPage", newPage);
router.get("/findPages", findPages);

export default router;
