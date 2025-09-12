import express from "express";
import authRouter from "./auth.js";
import petRouter from "./pet.js";
import aiRouter from "./ai.js";

const router = express.Router();

router.use("/auth", authRouter);  // /api/auth
router.use("/pets", petRouter);    // /api/pets
router.use("/ai", aiRouter);       // /api/ai

export default router;

