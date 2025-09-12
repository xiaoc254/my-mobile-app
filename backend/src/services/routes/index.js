import express from "express";
import authRouter from "./auth.js";
import petRouter from "./pet.js";

const router = express.Router();

router.use("/auth", authRouter);  // /api/auth
router.use("/pets", petRouter);  // /api/pets

export default router;

