import { Router } from "express";
import { prisma } from "../prisma";

export const productRouter = Router();

// Endpoint to list all products
productRouter.get("/", async (_req, res) => {
  const products = await prisma.product.findMany();

  // Return products with prices in dollars
  res.json(
    products.map((p) => ({
      id: p.id,
      name: p.name,
      unitPrice: p.unitPriceCents / 100,
    })),
  );
});
