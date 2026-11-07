import mongoose from "mongoose";
import { MONGODB_URI } from "../config.js";
import { connectRedis } from "./redis.connection.db.js";

export const checkConnectionDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("Connected to MongoDB successfully✔️ 🎉");
    await connectRedis();
  } catch (error) {
    console.log("Error connecting to MongoDB ✖️:", error);
  }
};
