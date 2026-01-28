import { Router } from "express";
import { usageRouter } from "./usage.routes";
import { walletRouter } from "./wallet.routes";
import { customerRouter } from "./customer.routes";
import { productRouter } from "./product.routes";

export const router = Router();

// Mount routers
router.use("/usage", usageRouter);
router.use("/wallet", walletRouter);
router.use("/customers", customerRouter);
router.use("/products", productRouter);
