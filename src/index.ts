import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { connectDB, closeDB } from "./database/connectDB";
import { errorHandler } from "./middlewares/error";
import { seedRoles } from "./scripts/seedRoles";
import path from "path";
import cors from "cors";
import helmet from "helmet";

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
import productFormRoute from "./routes/form.routes";
import productCategoryRoute from "./routes/productCategory.routes";
import cartRoute from "./routes/cart.routes";
import orderRoute from "./routes/order.routes";
import couponRoute from "./routes/coupon.routes";
import ticketRoutes from "./routes/ticket.routes";
import invoiceRoutes from "./routes/invoices.routes";
import { emptyCartJob } from "./cron-jobs/empty-cart";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;
const basePath = "/api/v2";

// CORS Middleware
const allowedOrigins = [
  "https://rwf4p3bf-3000.inc1.devtunnels.ms",
  "https://dashboard-adaired.vercel.app",
  "https://ad-admin-five.vercel.app",
  "https://www.adaired.com",
  "https://adaired.com",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
];

// ========================
// 🛡️ Security Middleware
// ========================
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || allowedOrigins,
    credentials: true,
    maxAge: 86400, // 24h CORS preflight cache
  })
);

// ========================
// ⚡ Performance Optimizations
// ========================
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl === "/api/v2/orders/stripe-webhook") {
    // Skip JSON parsing for Stripe webhook
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: false }));

// Ping Endpoint (minimal response)
app.get(`${basePath}/ping`, (req: Request, res: Response) => {
  res.send("pong 🏓");
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
app.use(`${basePath}/tickets`, ticketRoutes);
app.use(`${basePath}/invoices`, invoiceRoutes);

// Static files and View Engine
app.use("/static", express.static(path.join(__dirname + "static")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Root Route
app.get(`${basePath}/`, (req: Request, res: Response) => {
  res.render("index");
});

// ========================
// 🛑 Error Handling
// ========================
app.use(errorHandler);

// ========================
// ⏱️ Startup & Shutdown
// ========================
const startServer = async () => {
  try {
    console.log("🔧 Initializing MongoDB connection...");

    // Connect to DB first
    await connectDB();

    // Seed roles during startup if enabled
    if (process.env.SEED_ON_STARTUP === "true") {
      await seedRoles();
    }

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // Start background jobs
    emptyCartJob.start();
    console.log("⏱️ Cron jobs initialized");

    return server;
  } catch (error) {
    console.error("🔥 Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log("\n🛑 Graceful shutdown initiated...");

  try {
    emptyCartJob.stop();
    await closeDB();
    console.log("✅ Server shutdown complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Graceful shutdown failed:", err);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown); // Ctrl+C
process.on("SIGTERM", shutdown); // Kubernetes/Docker stop

// Start the server
startServer();
