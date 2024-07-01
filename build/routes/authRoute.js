"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validator_1 = require("../helpers/validator");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
// Register route
router.post("/register", validator_1.validateRegister, authController_1.register);
// Login route
router.post("/login", validator_1.validateLogin, authController_1.login);
// Logout route
router.get("/logout", authMiddleware_1.default, authController_1.logout);
// Current User route
router.get("/refetch", authMiddleware_1.default, authController_1.currentUser);
exports.default = router;
