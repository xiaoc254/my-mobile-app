import mongoose from "mongoose";
import { config } from "../env.config.js";

mongoose.connect(config.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));
