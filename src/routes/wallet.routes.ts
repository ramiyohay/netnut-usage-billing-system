import { Router } from "express";
import { prisma } from "../prisma";

export const walletRouter = Router();

// Endpoint to credit a wallet
walletRouter.post("/credit", async (req, res) => {
  const { customerId, amount } = req.body;
  const amountCents = Math.round(amount * 100);
  const wallet = await prisma.wallet.findUnique({
    where: { customerId },
  });

  if (!wallet) return res.sendStatus(404);

  // Credit the wallet
  const updatedWallet = await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balanceCents: wallet.balanceCents + amountCents },
  });

  res.json({ balance: updatedWallet.balanceCents / 100 });
});
