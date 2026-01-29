import request from "supertest";
import { PrismaClient } from "@prisma/client";
import { app } from "../src/app";
import { runBillingCycle } from "../src/services/billing.service";

const prisma = new PrismaClient();

describe("billing flow", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("add new usage event", async () => {
    const customer = await prisma.customer.create({
      data: { name: "Customer A" },
    });

    await prisma.wallet.create({
      data: {
        customerId: customer.id,
        balanceCents: 10_000,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product Z",
        unitPriceCents: 200,
      },
    });

    const res = await request(app).post("/usage").send({
      customerId: customer.id,
      productId: product.id,
      units: 3,
    });

    expect(res.status).toBe(201);

    const usage = await prisma.usageEvent.findFirst();

    expect(usage).not.toBeNull();
    expect(usage?.processedAt).toBeNull();
  });

  test("billing cycle charges wallet and set usage as processed", async () => {
    const customer = await prisma.customer.create({
      data: { name: "Customer B" },
    });

    const wallet = await prisma.wallet.create({
      data: {
        customerId: customer.id,
        balanceCents: 5_000,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product Y",
        unitPriceCents: 500,
      },
    });

    await prisma.usageEvent.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        units: 4, // $20
      },
    });

    await runBillingCycle();

    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    });

    expect(updatedWallet?.balanceCents).toBe(3_000);

    const usage = await prisma.usageEvent.findFirst();

    expect(usage?.processedAt).not.toBeNull();
    expect(usage?.costCents).toBe(2_000);

    const tx = await prisma.walletTransaction.findFirst();

    expect(tx?.amountCents).toBe(-2_000);
    expect(tx?.type).toBe("DEBIT");
  });

  test("billing cycle is does not double charge", async () => {
    const customer = await prisma.customer.create({
      data: { name: "Customer C" },
    });

    await prisma.wallet.create({
      data: {
        customerId: customer.id,
        balanceCents: 1_000,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Product X",
        unitPriceCents: 300,
      },
    });

    await prisma.usageEvent.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        units: 2, // $6
      },
    });

    await runBillingCycle();
    await runBillingCycle();

    const wallet = await prisma.wallet.findUnique({
      where: { customerId: customer.id },
    });

    expect(wallet?.balanceCents).toBe(400);
  });

  test("returns balance of a user", async () => {
    const customer = await prisma.customer.create({
      data: { name: "Customer D" },
    });

    await prisma.wallet.create({
      data: {
        customerId: customer.id,
        balanceCents: 500,
      },
    });

    const product = await prisma.product.create({
      data: {
        name: "Storage",
        unitPriceCents: 400,
      },
    });

    await prisma.usageEvent.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        units: 2, // $8
      },
    });

    await runBillingCycle();

    const res = await request(app).get(`/customers/${customer.id}/balance`);

    expect(res.status).toBe(200);
    expect(res.body.balance).toBe(-3);
    expect(res.body.hasFunds).toBe(false);
    expect(Array.isArray(res.body.usage)).toBe(true);
    expect(res.body.usage.length).toBe(1);
    expect(res.body.usage[0]).toMatchObject({
      units: 2,
    });
  });
});
