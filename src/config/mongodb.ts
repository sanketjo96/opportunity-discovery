import mongoose from "mongoose";

/**
 * Idempotent connect for workers and services. Throws on failure (no process.exit).
 */
export async function connectMongo(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const uri = process.env.MONGO_URI;
  if (!uri?.trim()) {
    throw new Error("MONGO_URI is not set");
  }
  await mongoose.connect(uri);
}

export async function connectDB(): Promise<void> {
  try {
    await connectMongo();
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error", error);
    process.exit(1);
  }
}
