"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const blogController_1 = require("../controllers/blogController");
const express_1 = __importDefault(require("express"));
const validator_1 = require("../helpers/validator");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
router.post("/createNewBlog", authMiddleware_1.default, validator_1.validateBlog, blogController_1.newBlog);
router.put("/updateBlog", authMiddleware_1.default, validator_1.validateBlog, blogController_1.updateBlog);
exports.default = router;
