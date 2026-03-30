import mongoose from "mongoose";
import { MONGODB_URI } from "../../config/config.service.js";

export const checkConnectionDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB successfully✔️ 🎉");
    } catch (error) {
        console.log("Error connecting to MongoDB ✖️:", error);
    }
};