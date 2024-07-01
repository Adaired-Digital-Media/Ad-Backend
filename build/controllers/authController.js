"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUser = exports.logout = exports.login = exports.register = void 0;
const userModel_1 = __importDefault(require("../models/userModel"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const error_1 = require("../middlewares/error");
const express_validator_1 = require("express-validator");
// Register Endpoint
const register = async (req, res, next) => {
    try {
        const { name, email, password, contact, userStatus } = req.body;
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        // Check if user already exists
        const userExists = await userModel_1.default.findOne({ email });
        if (userExists) {
            throw new error_1.CustomError(400, "User already exists");
        }
        // Hash Password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Create User
        const user = await userModel_1.default.create({
            name,
            email: email.toLowerCase(),
            userName: email.split("@")[0].toLowerCase(),
            password: hashedPassword,
            contact,
            userStatus,
        });
        // Check if Admin
        const Users = await userModel_1.default.find();
        if (Users.length === 1) {
            user.isAdmin = true;
            user.role = null;
            await user.save();
        }
        // Generate Token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE,
        });
        res.status(201).json({ token, user });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
// Login Endpoint
const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;
        // Validate user input
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid input",
                errors: errors.array(),
            });
        }
        // Check if user exists
        const user = await userModel_1.default.findOne({ email });
        if (!user) {
            throw new error_1.CustomError(400, "User not found");
        }
        // Check if password is correct
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new error_1.CustomError(401, "Invalid Credentials");
        }
        // Generate Token
        const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: rememberMe === false ? "" : process.env.JWT_EXPIRE,
        });
        // Get User Data With Role and Permissions
        const userData = await userModel_1.default.aggregate([
            {
                $match: {
                    email: user.email,
                },
            },
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
        res.cookie("ad_access", token).status(200).json({
            message: "User logged in successfully!",
            ad_access: token,
            userData: userData[0],
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
// Logout Endpoint
const logout = async (req, res, next) => {
    try {
        res
            .clearCookie("ad_access", { sameSite: "none", secure: true })
            .status(200)
            .json("User logged out successfully!");
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
// Fetch Current User Details
const currentUser = async (req, res, next) => {
    const ad_access = req.cookies.ad_access;
    try {
        const decoded = jsonwebtoken_1.default.verify(ad_access, process.env.JWT_SECRET);
        const id = decoded._id;
        const user = await userModel_1.default.findOne({ _id: id });
        const userData = await userModel_1.default.aggregate([
            {
                $match: {
                    email: user.email,
                },
            },
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
        res.status(200).json(userData);
    }
    catch (error) {
        next(error);
    }
};
exports.currentUser = currentUser;
