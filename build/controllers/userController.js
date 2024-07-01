"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserById = exports.getAllUsers = exports.updateUser = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const error_1 = require("../middlewares/error");
const express_validator_1 = require("express-validator");
const authHelper_1 = __importDefault(require("../helpers/authHelper"));
// Update user
const updateUser = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "users", 2);
        if (!permissionCheck)
            return;
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        const { userId, ...updateData } = req.body;
        if (updateData.password) {
            const salt = await bcrypt_1.default.genSalt(10);
            updateData.password = await bcrypt_1.default.hash(updateData.password, salt);
        }
        const updatedUser = await userModel_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
        });
        res.status(200).json({
            message: "Role updated successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
// Get all users
const getAllUsers = async (req, res, next) => {
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "users", 1);
        if (!permissionCheck)
            return;
        const users = await userModel_1.default.aggregate([
            {
                $lookup: {
                    from: "roles",
                    localField: "role",
                    foreignField: "_id",
                    as: "role",
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    userName: 1,
                    contact: 1,
                    userStatus: 1,
                    isAdmin: 1,
                    role: {
                        $cond: {
                            if: { $isArray: "$role" },
                            then: { $arrayElemAt: ["$role", 0] },
                            else: null,
                        },
                    },
                },
            },
            {
                $addFields: {
                    role: {
                        role: "$role.role",
                    },
                },
            },
        ]);
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
//Get user by id
const getUserById = async (req, res, next) => {
    const { userId } = req.body;
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "users", 1);
        if (!permissionCheck)
            return;
        // Validating if given Id is valid
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        const user = await userModel_1.default.findById(userId);
        if (!user) {
            throw new error_1.CustomError(404, "User not found!");
        }
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
// Delete user
const deleteUser = async (req, res, next) => {
    const LoggedInUser = req.userId;
    const { userId } = req.body;
    try {
        const permissionCheck = await (0, authHelper_1.default)(req.userId, "users", 1);
        if (!permissionCheck)
            return;
        // Validating if given Id is valid
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        // Find user
        const userToDelete = await userModel_1.default.findById(userId);
        // Validating if the user exists
        if (!userToDelete) {
            throw new error_1.CustomError(404, "User not found!");
        }
        // Validating if the user is trying to delete an admin or themselves
        if (userToDelete.isAdmin || userId === LoggedInUser) {
            throw new error_1.CustomError(403, "You are not allowed to delete this user!");
        }
        await userModel_1.default.findByIdAndDelete(userId);
        res.status(200).json({ message: "User deleted successfully!" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
