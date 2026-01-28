import { Router } from "express";
import { prisma } from "../prisma";

export const usageRouter = Router();

// Endpoint to record a usage event
usageRouter.post("/", async (req, res) => {
  const { customerId, productId, units } = req.body;

  // Validate input
  if (!customerId || !productId || typeof units !== "number" || units <= 0) {
    return res.status(400).json({ error: "Invalid usage payload" });
  }

  // Create usage event
  const usageEvent = await prisma.usageEvent.create({
    data: { customerId, productId, units },
  });

  res.status(201).json(usageEvent);
});
