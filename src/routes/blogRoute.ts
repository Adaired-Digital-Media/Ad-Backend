import { newBlog, readBlog, updateBlog,deleteBlog,duplicateBlog } from "../controllers/blogController";
import express, { Router } from "express";
import { validateBlog, validateUpdateBlog } from "../helpers/validator";
import verifyToken from "../middlewares/authMiddleware";
const router: Router = express.Router();

router.post("/createBlog", verifyToken, validateBlog, newBlog);
router.get("/readBlog/:identifier?", readBlog);
router.put("/updateBlog/:blogId", verifyToken, validateUpdateBlog, updateBlog);
router.delete("/deleteBlog/:blogId", verifyToken, validateUpdateBlog, deleteBlog);
router.post("/duplicateBlog/:blogId", verifyToken, validateUpdateBlog, duplicateBlog);


export default router;
