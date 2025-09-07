import express from "express";
import authRouter from "./auth.js";

const router = express.Router();

router.use("/auth", authRouter);  // /api/auth
export default router;

