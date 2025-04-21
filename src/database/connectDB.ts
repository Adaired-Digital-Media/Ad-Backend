import mongoose from "mongoose";

// Type for MongoDB connection options
type MongoOptions = mongoose.ConnectOptions & {
  maxPoolSize?: number;
  minPoolSize?: number;
  retryDelayMs?: number;
};

// Global connection check
let isConnected = false;

const DEFAULT_OPTIONS: MongoOptions = {
  autoIndex: process.env.NODE_ENV === "development", 
  maxPoolSize: 10, 
  minPoolSize: 2, 
  socketTimeoutMS: 30000, 
  serverSelectionTimeoutMS: 5000, 
  heartbeatFrequencyMS: 10000, 
  retryWrites: true,
  retryReads: true,
  appName: "Backend_v2",
};

/**
 * Safely connects to MongoDB with production-ready settings
 */
export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log("🔄 Using existing MongoDB connection");
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable not configured");
  }

  try {
    console.time("🔗 MongoDB connection time");
    
    await mongoose.connect(process.env.MONGODB_URI, DEFAULT_OPTIONS);
    isConnected = true;
    
    console.timeEnd("🔗 MongoDB connection time");

    // Event listeners for connection health
    mongoose.connection.on("connected", () => {
      console.log("📈 MongoDB connection active");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️ MongoDB disconnected");
      isConnected = false;
    });

  } catch (error) {
    console.error("🔥 MongoDB connection failed:", error);
    throw error;
  }
};

/**
 * Gracefully closes the MongoDB connection
 */
export const closeDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log("🛑 MongoDB connection closed");
  }
};