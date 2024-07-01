"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multerMiddleware_1 = require("../middlewares/multerMiddleware");
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const error_1 = require("../middlewares/error");
const router = express_1.default.Router();
// Endpoint to upload files
router.post("/upload", authMiddleware_1.default, multerMiddleware_1.upload.single("file"), (req, res) => {
    console.log(req.file);
    res.send("File uploaded successfully!");
});
// Endpoint to fetch files
router.get("/files", authMiddleware_1.default, async (req, res) => {
    try {
        const uploadsPath = path_1.default.join(__dirname, "..", "static", "uploads");
        const files = await fs_1.default.promises.readdir(uploadsPath);
        res.json({
            files: files,
        });
    }
    catch (error) {
        console.error("Error fetching files:", error);
        throw new error_1.CustomError(500, "Internal Server Error");
    }
});
exports.default = router;
