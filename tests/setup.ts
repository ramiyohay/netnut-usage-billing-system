import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const dbPath = path.join(process.cwd(), "prisma", "test.db");

beforeAll(() => {
  // Ensure fresh test DB
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }

  // Apply migrations to test DB
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: {
      ...process.env,
      DATABASE_URL: "file:./prisma/test.db",
    },
  });
});

// Clean up data before each test
beforeEach(async () => { 
  await prisma.walletTransaction.deleteMany();
  await prisma.usageEvent.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
});

// Disconnect Prisma after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
