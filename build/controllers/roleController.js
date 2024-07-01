"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.findRoles = exports.updateRole = exports.newRole = void 0;
const roleModel_1 = __importDefault(require("../models/roleModel"));
const error_1 = require("../middlewares/error");
const express_validator_1 = require("express-validator");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
// Create a new role
const newRole = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "roles", 0);
        if (!permissionCheck)
            return;
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        const { roleName, roleDescription, roleStatus, rolePermissions } = req.body;
        // check if roleName is already in use
        const existingRole = await roleModel_1.default.findOne({
            roleName: {
                $regex: roleName,
                $options: "i",
            },
        });
        if (existingRole) {
            throw new error_1.CustomError(400, "Role with this name already exists");
        }
        // Create new role
        const newRole = new roleModel_1.default({
            roleName,
            roleDescription,
            roleStatus,
            rolePermissions,
        });
        await newRole.save();
        res.status(201).json({
            message: "Role created successfully",
            data: newRole,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.newRole = newRole;
// Update Role
const updateRole = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "roles", 1);
        if (!permissionCheck)
            return;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        const { roleId, roleName, rolePermissions, ...updateData } = req.body;
        // Check role name availability
        if (roleName) {
            const existingRole = await roleModel_1.default.findOne({
                roleName: { $regex: roleName, $options: "i" },
                _id: { $ne: roleId },
            });
            if (existingRole) {
                throw new error_1.CustomError(400, "Role with this name already exists");
            }
        }
        // Prepare update operations
        const updateOperations = [];
        if (Object.keys(updateData).length > 0) {
            updateOperations.push({
                updateOne: {
                    filter: { _id: roleId },
                    update: { $set: updateData },
                },
            });
        }
        if (rolePermissions) {
            updateOperations.push({
                updateOne: {
                    filter: { _id: roleId },
                    update: { $set: { rolePermissions } },
                },
            });
        }
        // Execute bulk write operation
        if (updateOperations.length > 0) {
            await roleModel_1.default.bulkWrite(updateOperations);
        }
        // Fetch updated role details
        const updatedRole = await roleModel_1.default.findById(roleId);
        res.status(200).json({
            message: "Role updated successfully",
            data: updatedRole,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateRole = updateRole;
// Find Roles
const findRoles = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "roles", 2);
        if (!permissionCheck)
            return;
        const { roleId } = req.body;
        if (roleId) {
            const role = await roleModel_1.default.find({ _id: roleId });
            res.status(200).json({
                message: "Role fetched successfully",
                data: role,
            });
        }
        else {
            const roles = await roleModel_1.default.find();
            res.status(200).json({
                message: "Roles fetched successfully",
                data: roles,
            });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.findRoles = findRoles;
// Delete Role
const deleteRole = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "roles", 3);
        if (!permissionCheck)
            return;
        const { roleId } = req.body;
        if (!roleId) {
            throw new error_1.CustomError(400, "Invalid input");
        }
        const role = await roleModel_1.default.findById(roleId);
        if (!role) {
            throw new error_1.CustomError(404, "Role not found");
        }
        await roleModel_1.default.deleteOne({ _id: roleId });
        res.status(200).json({
            message: "Role deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteRole = deleteRole;
