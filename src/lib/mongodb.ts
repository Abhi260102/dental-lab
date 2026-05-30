import mongoose from "mongoose";
import User from "@/models/User";
import WarrantyCard from "@/models/WarrantyCard";
import Template from "@/models/Template";
import ActivityLog from "@/models/ActivityLog";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declare global type to store mongoose cache
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Ensure models are registered in serverless environments to prevent MissingSchemaError
  const _registerModels = [User, WarrantyCard, Template, ActivityLog];

  if (cached!.conn) {
    return cached!.conn;
  }

  // Check if mongoose is already connected globally (independent of local cache)
  if (mongoose.connection.readyState === 1) {
    cached!.conn = mongoose;
    return cached!.conn;
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached!.promise = mongoose.connect(MONGODB_URI as string, opts).then((m) => {
      return m;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn;
}

export default dbConnect;
