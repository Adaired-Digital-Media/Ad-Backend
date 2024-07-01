"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const connectDB_1 = __importDefault(require("./database/connectDB"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const error_1 = require("./middlewares/error");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
// Routers Import
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const roleRoute_1 = __importDefault(require("./routes/roleRoute"));
const blogRoute_1 = __importDefault(require("./routes/blogRoute"));
const blogCategoryRoute_1 = __importDefault(require("./routes/blogCategoryRoute"));
const multerRoute_1 = __importDefault(require("./routes/multerRoute"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
// CORS Middleware
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
// Routes Middleware
app.use("/api/v2/auth", authRoute_1.default);
app.use("/api/v2/user", userRoute_1.default);
app.use("/api/v2/role", roleRoute_1.default);
app.use("/api/v2/blog", blogRoute_1.default);
app.use("/api/v2/blog/category", blogCategoryRoute_1.default);
app.use("/api/v2/multer", multerRoute_1.default);
// Error Handler
app.use(error_1.errorHandler);
// View Engine
app.use("/static", express_1.default.static(path_1.default.join(__dirname + "/static")));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.get("/", (req, res) => {
    res.render("index");
});
app.listen(process.env.PORT, () => {
    (0, connectDB_1.default)();
    console.log(`Server is running on port ${process.env.PORT}`);
});
