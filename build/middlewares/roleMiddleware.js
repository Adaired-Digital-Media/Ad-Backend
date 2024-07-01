"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = __importDefault(require("../models/userModel"));
const verifyRoleAndPermission = async (req, res, next, role) => {
    const ad_access = req.cookies.ad_access;
    if (!ad_access) {
        return next(new error_1.CustomError(401, "No token, authorization denied"));
    }
    try {
        const payload = jsonwebtoken_1.default.verify(ad_access, process.env.JWT_SECRET);
        const user = await userModel_1.default.findById(payload._id).select("-password");
        if (!user) {
            return next(new error_1.CustomError(401, "Token is not valid"));
        }
        if (user.isAdmin) {
            next();
        }
        else {
        }
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyRoleAndPermission;
