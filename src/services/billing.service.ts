import { prisma } from "../prisma";

export async function runBillingCycle() {
  const events = await prisma.usageEvent.findMany({
    where: { processedAt: null },
    include: { product: true },
  });

  console.log(`Processing ${events.length} billing events`);

  // Process each usage event
  for (const e of events) {
    const costCents = e.product.unitPriceCents * e.units;

    // Record the wallet transaction
    await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { customerId: e.customerId },
      });
      
      if (!wallet) return;

      // Debit the wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balanceCents: wallet.balanceCents - costCents },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amountCents: -costCents,
          type: "DEBIT",
          usageEventId: e.id,
        },
      });

      // Mark the event as processed
      await tx.usageEvent.update({
        where: { id: e.id },
        data: { costCents, processedAt: new Date() },
      });
    });
  }

  console.log(`Billing cycle completed`);
}
