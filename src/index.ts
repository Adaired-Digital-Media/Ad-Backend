import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error";
import path from "path";
import cors from "cors";

// Routers Import
import authRoute from "./routes/authRoute";
import userRoute from "./routes/userRoute";
import roleRoute from "./routes/roleRoute";
import blogRoute from "./routes/blogRoute";
import blogCategoryRoute from "./routes/blogCategoryRoute";
import multerRoute from "./routes/multerRoute";
import pageRoute from "./routes/pageRoute";

const app: Application = express();

dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS Middleware
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

// Routes Middleware
app.use("/api/v2/auth", authRoute);
app.use("/api/v2/user", userRoute);
app.use("/api/v2/role", roleRoute);
app.use("/api/v2/blog", blogRoute);
app.use("/api/v2/blog/category", blogCategoryRoute);
app.use("/api/v2/multer", multerRoute);
app.use("/api/v2/page", pageRoute);

// Error Handler
app.use(errorHandler);

// View Engine
app.use("/static", express.static(path.join(__dirname + "/static")));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

app.listen(process.env.PORT, () => {
  connectDB();
  console.log(`Server is running on port ${process.env.PORT}`);
});
