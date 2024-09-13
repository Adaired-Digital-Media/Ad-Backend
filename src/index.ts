import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB";
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

// CORS Middleware
const allowedOrigins = ['http://localhost:3000', 'http://another-origin.com'];
const corsOptions = {
  origin: (origin: any, callback: any) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};
app.use(cors(corsOptions));

// Prefix all routes with /backend/api/v2
const basePath = "/api/v2";

// Use basePath for all routes
app.use(`${basePath}/multer`, multerRoute);
app.use(`${basePath}/auth`, authRoute);
app.use(`${basePath}/user`, userRoute);
app.use(`${basePath}/role`, roleRoute);
app.use(`${basePath}/blog`, blogRoute);
app.use(`${basePath}/blog/category`, blogCategoryRoute);
app.use(`${basePath}/case-study`, caseStudyRoute);
app.use(`${basePath}/case-study/category`, caseStudyCategoryRoute);
app.use(`${basePath}/service`, serviceRoute);

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
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
