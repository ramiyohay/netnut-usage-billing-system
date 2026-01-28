import { Router } from "express";
import { prisma } from "../prisma";

export const customerRouter = Router();

// List customers
customerRouter.get("/", async (_req, res) => {
  const customers = await prisma.customer.findMany({
    include: {
      wallet: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  res.json(
    customers.map((c) => ({
      id: c.id,
      name: c.name,
      balance: c.wallet ? c.wallet.balanceCents / 100 : 0,
      hasFunds: c.wallet ? c.wallet.balanceCents > 0 : false,
    })),
  );
});

// Get customer balance and usage history
customerRouter.get("/:id/balance", async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: {
      wallet: true,
      usage: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer || !customer.wallet) return res.sendStatus(404);

  res.json({
    balance: customer.wallet.balanceCents / 100,
    hasFunds: customer.wallet.balanceCents > 0,
    usage: customer.usage.map((u) => ({
      id: u.id,
      units: u.units,
      cost: u.costCents !== null ? u.costCents / 100 : null,
      processedAt: u.processedAt,
      createdAt: u.createdAt,
    })),
  });
});
