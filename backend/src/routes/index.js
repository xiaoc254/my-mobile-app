import express from "express";
import authRouter from "./auth.js";
import petRouter from "./pet.js";
import aiRouter from "./ai.js";
import productRouter from "./product.js";
import orderRouter from "./order.js";
import categoryRouter from "./category.js";
import cartRouter from "./cart.js";

const router = express.Router();

router.use("/auth", authRouter);  // /api/auth
router.use("/pets", petRouter);    // /api/pets
router.use("/ai", aiRouter);       // /api/ai
router.use("/products", productRouter);  // /api/products
router.use("/orders", orderRouter);  // /api/orders
router.use("/categories", categoryRouter);  // /api/categories
router.use("/cart", cartRouter);  // /api/cart

export default router;

