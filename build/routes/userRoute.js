"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const validator_1 = require("../helpers/validator");
// Update user route
router.put("/updateUser", authMiddleware_1.default, validator_1.validateUpdate, userController_1.updateUser);
// Get all users route
router.get("/getAllUsers", authMiddleware_1.default, userController_1.getAllUsers);
// Get user by id route
router.get("/getUserById", authMiddleware_1.default, validator_1.validateUserId, userController_1.getUserById);
// Delete user route
router.delete("/deleteUserById", authMiddleware_1.default, validator_1.validateUserId, userController_1.deleteUser);
exports.default = router;
