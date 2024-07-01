import { newBlog,updateBlog } from "../controllers/blogController";
import express, { Router } from "express";
import { validateBlog } from "../helpers/validator";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/createNewBlog", verifyToken, validateBlog, newBlog);
router.put("/updateBlog", verifyToken, validateBlog, updateBlog);

export default router;
