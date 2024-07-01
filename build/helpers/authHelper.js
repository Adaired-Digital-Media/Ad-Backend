"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("../middlewares/error");
const userModel_1 = __importDefault(require("../models/userModel"));
const roleModel_1 = __importDefault(require("../models/roleModel"));
// Cache for role permissions
const rolePermissionsCache = new Map();
const checkPermission = async (userId, entity, action) => {
    try {
        // Check if user is admin
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            throw new error_1.CustomError(404, "User not found");
        }
        if (user.isAdmin) {
            console.log("User is admin");
            return true;
        }
        // Fetch role permissions from cache or database
        let rolePermissions = rolePermissionsCache.get(user.role);
        if (!rolePermissions) {
            const roleInfo = await roleModel_1.default.findById(user.role);
            if (!roleInfo) {
                throw new error_1.CustomError(404, "Role not found");
            }
            rolePermissions = roleInfo.rolePermissions;
            rolePermissionsCache.set(user.role, rolePermissions);
        }
        // Check if user has permission
        const hasPermission = rolePermissions.some((role) => {
            return role.entityName === entity && role.entityValues.includes(action);
        });
        // Return true if user has permission
        if (hasPermission) {
            return true;
        }
        else {
            throw new error_1.CustomError(403, "Access denied!");
        }
    }
    catch (error) {
        console.error("Permission check failed:", error);
        throw new error_1.CustomError(403, "Access denied!");
    }
};
exports.default = checkPermission;
