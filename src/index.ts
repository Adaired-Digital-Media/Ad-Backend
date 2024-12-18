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
import productRoute from "./routes/productRoute";
import productFormRoute from "./routes/productFormRoute";
import productCategoryRoute from "./routes/productCategoryRoute";
import cartRoute from "./routes/cartRoute";
import junkCartLeadsRoute from "./routes/junkCartLeadsRoute";
import orderRoute from "./routes/orderRoute";

const app: Application = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
// Middleware for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v2/orders/stripe-webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));

// CORS Middleware
const allowedOrigins = [
  "https://dashboard-adaired.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (allowedOrigins.includes(origin as string) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

const basePath = "/api/v2";

app.use(`${basePath}/multer`, multerRoute);
app.use(`${basePath}/auth`, authRoute);
app.use(`${basePath}/user`, userRoute);
app.use(`${basePath}/role`, roleRoute);
app.use(`${basePath}/blog`, blogRoute);
app.use(`${basePath}/blog/category`, blogCategoryRoute);
app.use(`${basePath}/case-study`, caseStudyRoute);
app.use(`${basePath}/case-study/category`, caseStudyCategoryRoute);
app.use(`${basePath}/service`, serviceRoute);
app.use(`${basePath}/product`, productRoute);
app.use(`${basePath}/product/form`, productFormRoute);
app.use(`${basePath}/product/category`, productCategoryRoute);
app.use(`${basePath}/cart`, cartRoute);
app.use(`${basePath}/junk-cart/leads`, junkCartLeadsRoute);
app.use(`${basePath}/orders`, orderRoute);

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
