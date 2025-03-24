import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import connectDB from "./database/connectDB";
import { errorHandler } from "./middlewares/error";
import path from "path";
import cors from "cors";

// Routers Import
import multerRoute from "./routes/multer.routes";
import authRoute from "./routes/auth.routes";
import userRoute from "./routes/user.routes";
import roleRoute from "./routes/role.routes";
import permissionModuleRoute from "./routes/permissionModule.routes";
import blogRoute from "./routes/blog.routes";
import blogCategoryRoute from "./routes/blogCategory.routes";
import caseStudyRoute from "./routes/casestudy.routes";
import caseStudyCategoryRoute from "./routes/casestudyCategory.routes";
import serviceRoute from "./routes/service.routes";
import productRoute from "./routes/product.routes";
import productFormRoute from "./routes/productForm.routes";
import productCategoryRoute from "./routes/productCategory.routes";
import cartRoute from "./routes/cart.routes";
import orderRoute from "./routes/order.routes";
import couponRoute from "./routes/coupon.routes";
import { emptyCartJob, runEmptyExpiredCartsNow } from "./cron-jobs/empty-cart";
import mongoose from "mongoose";

const app: Application = express();
const PORT = process.env.PORT || 8080;

dotenv.config();

// Middleware for all other routes
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/v2/orders/stripe-webhook") {
    // Skip JSON parsing for Stripe webhook
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: false }));

// CORS Middleware
const allowedOrigins = [
  "https://rwf4p3bf-3000.inc1.devtunnels.ms",
  "https://dashboard-adaired.vercel.app",
  "https://www.adaired.com",
  "https://adaired.com",
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

// Ping Endpoint (minimal response)
app.get(`${basePath}/ping`, (req: Request, res: Response) => {
  res.status(200).send("pong");
});

app.use(`${basePath}/multer`, multerRoute);
app.use(`${basePath}/auth`, authRoute);
app.use(`${basePath}/user`, userRoute);
app.use(`${basePath}/role`, roleRoute);
app.use(`${basePath}/permissionModule`, permissionModuleRoute);
app.use(`${basePath}/blog`, blogRoute);
app.use(`${basePath}/blog/category`, blogCategoryRoute);
app.use(`${basePath}/case-study`, caseStudyRoute);
app.use(`${basePath}/case-study/category`, caseStudyCategoryRoute);
app.use(`${basePath}/service`, serviceRoute);
app.use(`${basePath}/product`, productRoute);
app.use(`${basePath}/product/form`, productFormRoute);
app.use(`${basePath}/product/category`, productCategoryRoute);
app.use(`${basePath}/cart`, cartRoute);
app.use(`${basePath}/orders`, orderRoute);
app.use(`${basePath}/coupons`, couponRoute);

// Static files and View Engine
app.use("/static", express.static(path.join(__dirname + "static")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Root Route
app.get(`${basePath}/`, (req: Request, res: Response) => {
  res.render("index");
});

// Error Handler
app.use(errorHandler);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    // Start cron job after DB is ready
    emptyCartJob.start();
    // Run once immediately with error handling
    try {
      await runEmptyExpiredCartsNow();
      console.log("Initial cart emptying completed");
    } catch (error) {
      console.error("Initial cart emptying failed:", error);
      // Optional: Retry logic here
    }
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

process.on("SIGINT", async () => {
  emptyCartJob.stop();
  console.log("Empty cart cron job stopped");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});
