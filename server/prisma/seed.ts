import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client.js";

import { hashPassword } from "../src/lib/password.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
  max: 2,
  connectionTimeoutMillis: 5_000,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedAdmin(): Promise<void> {
  const username = process.env.ADMIN_USERNAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !email || !password) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD must be defined",
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists.");
    return;
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  console.log("Admin created.");
}

async function seedSuppliers(): Promise<void> {
  const password = process.env.DEMO_SUPPLIER_PASSWORD;

  if (!password) {
    throw new Error("DEMO_SUPPLIER_PASSWORD must be defined");
  }

  const demoSuppliers = [
    {
      username: "luxury_time",
      email: "luxury.time@example.com",
      companyName: "Luxury Time",
      contactName: "Daniel Cohen",
      phone: "050-0000001",
    },
    {
      username: "golden_watch",
      email: "golden.watch@example.com",
      companyName: "Golden Watch",
      contactName: "Noa Levi",
      phone: "050-0000002",
    },
  ];

  for (const supplierData of demoSuppliers) {
    const existingUser = await prisma.user.findUnique({
      where: {
        username: supplierData.username,
      },
    });

    if (existingUser) {
      continue;
    }

    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        username: supplierData.username,
        email: supplierData.email,
        passwordHash,
        role: UserRole.SUPPLIER,

        supplier: {
          create: {
            companyName: supplierData.companyName,
            contactName: supplierData.contactName,
            phone: supplierData.phone,
          },
        },
      },
    });
  }

  console.log("Demo suppliers created.");
}

async function seedWatches(): Promise<void> {
  const watches = [
    {
      sku: "RLX-SUB-001",
      brand: "Rolex",
      model: "Submariner",
      name: "Submariner Black",
      adminCostPrice: 4500,
      defaultSupplierPrice: 5200,
      recommendedSalePrice: 6500,
      quantity: 20,
    },
    {
      sku: "TST-PRX-001",
      brand: "Tissot",
      model: "PRX",
      name: "PRX Powermatic",
      adminCostPrice: 1100,
      defaultSupplierPrice: 1350,
      recommendedSalePrice: 1900,
      quantity: 40,
    },
    {
      sku: "OMG-SEA-001",
      brand: "Omega",
      model: "Seamaster",
      name: "Seamaster Diver",
      adminCostPrice: 3800,
      defaultSupplierPrice: 4400,
      recommendedSalePrice: 5600,
      quantity: 15,
    },
    {
      sku: "TAG-CAR-001",
      brand: "TAG Heuer",
      model: "Carrera",
      name: "Carrera Automatic",
      adminCostPrice: 2600,
      defaultSupplierPrice: 3100,
      recommendedSalePrice: 4100,
      quantity: 18,
    },
    {
      sku: "LNG-HYD-001",
      brand: "Longines",
      model: "HydroConquest",
      name: "HydroConquest Automatic",
      adminCostPrice: 1700,
      defaultSupplierPrice: 2050,
      recommendedSalePrice: 2850,
      quantity: 25,
    },
    {
      sku: "SEI-PRS-001",
      brand: "Seiko",
      model: "Presage",
      name: "Presage Automatic",
      adminCostPrice: 600,
      defaultSupplierPrice: 750,
      recommendedSalePrice: 1100,
      quantity: 35,
    },
  ];

  for (const watchData of watches) {
    const {
      quantity,
      ...watch
    } = watchData;

    const createdWatch = await prisma.watch.upsert({
      where: {
        sku: watch.sku,
      },
      update: {},
      create: watch,
    });

    await prisma.warehouseInventory.upsert({
      where: {
        watchId: createdWatch.id,
      },
      update: {},
      create: {
        watchId: createdWatch.id,
        quantityOnHand: quantity,
      },
    });
  }

  console.log("Watches and warehouse inventory created.");
}

async function main(): Promise<void> {
  console.log("Starting database seed...");

  await seedAdmin();
  await seedSuppliers();
  await seedWatches();

  console.log("Database seed completed successfully.");
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });