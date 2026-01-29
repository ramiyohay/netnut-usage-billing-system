import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // add products
  const products = await prisma.product.createMany({
    data: [
      { name: "Apple", unitPriceCents: 5 },
      { name: "Banana", unitPriceCents: 1 },
      { name: "Orange", unitPriceCents: 2 },
    ],
  });

  const allProducts = await prisma.product.findMany();

  // add customers, wallets, and usage events
  for (let i = 0; i < 10; i++) {
    const c = await prisma.customer.create({
      data: { name: `Customer ${i + 1}` },
    });

    await prisma.wallet.create({
      data: { customerId: c.id, balanceCents: 2000 + i * 1000 },
    });

    await prisma.usageEvent.create({
      data: {
        customerId: c.id,
        productId: allProducts[i % allProducts.length].id,
        units: 5 + i,
      },
    });
  }
}

main().finally(() => prisma.$disconnect());
