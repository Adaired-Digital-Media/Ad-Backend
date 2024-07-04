import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import path from "path";
import cors from "cors";

// Routers Import
import multerRoute from "./routes/multerRoute";
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import roleRoute from "./routes/roleRoute";
import blogRoute from "./routes/blogRoute";
import blogCategoryRoute from "./routes/blogCategoryRoute";
import caseStudyRoute from "./routes/caseStudyRoute";
import caseStudyCategoryRoute from "./routes/caseStudyCategoryRoute";
import serviceRoute from "./routes/serviceRoute";

const app: Application = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // specify the exact origin
    credentials: true, // allow credentials
  })
);

// Routes Middleware
app.use("/api/v2/multer", multerRoute);
app.use("/api/v2/auth", authRoute);
app.use("/api/v2/user", userRoute);
app.use("/api/v2/role", roleRoute);
app.use("/api/v2/blog", blogRoute);
app.use("/api/v2/blog/category", blogCategoryRoute);
app.use("/api/v2/case-study", caseStudyRoute);
app.use("/api/v2/case-study/category", caseStudyCategoryRoute);
app.use("/api/v2/service", serviceRoute);

// Error Handler
app.use(errorHandler);

// View Engine
app.use("/static", express.static(path.join(__dirname + "/static")));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
