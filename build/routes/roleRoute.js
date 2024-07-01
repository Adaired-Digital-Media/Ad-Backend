"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validator_1 = require("../helpers/validator");
const roleController_1 = require("../controllers/roleController");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const router = express_1.default.Router();
router.post("/createNewRole", authMiddleware_1.default, validator_1.validateRole, roleController_1.newRole);
router.put("/editRole", authMiddleware_1.default, validator_1.validateUpdateRole, roleController_1.updateRole);
router.get("/findRoles", authMiddleware_1.default, validator_1.validateRoleId, roleController_1.findRoles);
router.delete("/deleteRole", authMiddleware_1.default, validator_1.validateRoleId, roleController_1.deleteRole);
exports.default = router;
