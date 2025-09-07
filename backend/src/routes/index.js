import express from "express";
import aiRoutes from "./aiRoute.js";
import authRouter from "./auth.js";

const router = express.Router();

router.use("/auth", authRouter);  // /api/auth
router.use("/ai", aiRoutes);      // /api/ai
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY);
export default router;

