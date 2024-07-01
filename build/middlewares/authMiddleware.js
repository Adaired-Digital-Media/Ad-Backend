"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const ad_access = req.cookies.ad_access;
    if (!ad_access) {
        throw new error_1.CustomError(401, "You are not authenticated!");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(ad_access, process.env.JWT_SECRET);
        req.userId = decoded._id;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.default = verifyToken;
