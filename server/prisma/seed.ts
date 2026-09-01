import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  PrismaClient,
  UserRole,
} from "../src/generated/prisma/client.js";

import {
  hashPassword,
} from "../src/lib/password.js";

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined",
  );
}

const adapter =
  new PrismaPg({
    connectionString,
    max: 2,
    connectionTimeoutMillis:
      5_000,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

/*
 * Creates the main Admin account.
 *
 * If the Admin already exists,
 * the seed does not create another one.
 */
async function seedAdmin(): Promise<void> {
  const username =
    process.env.ADMIN_USERNAME;

  const email =
    process.env.ADMIN_EMAIL;

  const password =
    process.env.ADMIN_PASSWORD;

  if (
    !username ||
    !email ||
    !password
  ) {
    throw new Error(
      "ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD must be defined",
    );
  }

  const existingAdmin =
    await prisma.user.findUnique({
      where: {
        username,
      },
    });

  if (existingAdmin) {
    console.log(
      "Admin already exists.",
    );

    return;
  }

  const passwordHash =
    await hashPassword(
      password,
    );

  await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,

      role:
        UserRole.ADMIN,
    },
  });

  console.log(
    "Admin created.",
  );
}

/*
 * Creates demo supplier accounts.
 *
 * companyName was removed from the Supplier model.
 * Each supplier is now identified through the
 * contact person and login account.
 */
async function seedSuppliers(): Promise<void> {
  const password =
    process.env
      .DEMO_SUPPLIER_PASSWORD;

  if (!password) {
    throw new Error(
      "DEMO_SUPPLIER_PASSWORD must be defined",
    );
  }

  const demoSuppliers = [
    {
      username:
        "luxury_time",

      email:
        "luxury.time@example.com",

      contactName:
        "Daniel Cohen",

      phone:
        "050-0000001",
    },

    {
      username:
        "golden_watch",

      email:
        "golden.watch@example.com",

      contactName:
        "Noa Levi",

      phone:
        "050-0000002",
    },
  ];

  for (
    const supplierData of
    demoSuppliers
  ) {
    const existingUser =
      await prisma.user.findUnique({
        where: {
          username:
            supplierData.username,
        },
      });

    if (existingUser) {
      continue;
    }

    const passwordHash =
      await hashPassword(
        password,
      );

    await prisma.user.create({
      data: {
        username:
          supplierData.username,

        email:
          supplierData.email,

        passwordHash,

        role:
          UserRole.SUPPLIER,

        supplier: {
          create: {
            contactName:
              supplierData.contactName,

            phone:
              supplierData.phone,
          },
        },
      },
    });
  }

  console.log(
    "Demo suppliers created.",
  );
}

/*
 * Creates demo watches and their initial
 * warehouse inventory.
 *
 * sku was removed from the Watch model.
 *
 * Since there is no longer a unique SKU,
 * demo watches are identified using:
 *
 * brand + model + name
 *
 * This keeps the seed safe to run more
 * than once without creating duplicates.
 */
async function seedWatches(): Promise<void> {
  const watches = [
    {
      brand: "Rolex",

      model:
        "Submariner",

      name:
        "Submariner Black",

      adminCostPrice:
        4500,

      defaultSupplierPrice:
        5200,

      recommendedSalePrice:
        6500,

      quantity: 20,
    },

    {
      brand: "Tissot",

      model: "PRX",

      name:
        "PRX Powermatic",

      adminCostPrice:
        1100,

      defaultSupplierPrice:
        1350,

      recommendedSalePrice:
        1900,

      quantity: 40,
    },

    {
      brand: "Omega",

      model:
        "Seamaster",

      name:
        "Seamaster Diver",

      adminCostPrice:
        3800,

      defaultSupplierPrice:
        4400,

      recommendedSalePrice:
        5600,

      quantity: 15,
    },

    {
      brand:
        "TAG Heuer",

      model:
        "Carrera",

      name:
        "Carrera Automatic",

      adminCostPrice:
        2600,

      defaultSupplierPrice:
        3100,

      recommendedSalePrice:
        4100,

      quantity: 18,
    },

    {
      brand:
        "Longines",

      model:
        "HydroConquest",

      name:
        "HydroConquest Automatic",

      adminCostPrice:
        1700,

      defaultSupplierPrice:
        2050,

      recommendedSalePrice:
        2850,

      quantity: 25,
    },

    {
      brand: "Seiko",

      model:
        "Presage",

      name:
        "Presage Automatic",

      adminCostPrice:
        600,

      defaultSupplierPrice:
        750,

      recommendedSalePrice:
        1100,

      quantity: 35,
    },
  ];

  for (
    const watchData of
    watches
  ) {
    const {
      quantity,
      ...watchDetails
    } = watchData;

    /*
     * Do not filter by deletedAt here.
     *
     * If an Admin deleted one of the demo
     * watches, running the seed again should
     * NOT recreate that deleted watch.
     */
    const existingWatch =
      await prisma.watch.findFirst({
        where: {
          brand:
            watchDetails.brand,

          model:
            watchDetails.model,

          name:
            watchDetails.name,
        },

        select: {
          id: true,
        },
      });

    let watchId: string;

    if (existingWatch) {
      watchId =
        existingWatch.id;
    } else {
      const createdWatch =
        await prisma.watch.create({
          data: {
            brand:
              watchDetails.brand,

            model:
              watchDetails.model,

            name:
              watchDetails.name,

            adminCostPrice:
              watchDetails.adminCostPrice,

            defaultSupplierPrice:
              watchDetails.defaultSupplierPrice,

            recommendedSalePrice:
              watchDetails.recommendedSalePrice,

            /*
             * Images can be added later
             * through the Admin interface.
             */
            imageUrl:
              null,

            imageUrls:
              [],
          },

          select: {
            id: true,
          },
        });

      watchId =
        createdWatch.id;
    }

    /*
     * Creates the warehouse inventory only
     * when it does not already exist.
     *
     * Existing quantities are never overwritten.
     */
    await prisma.warehouseInventory.upsert({
      where: {
        watchId,
      },

      update: {},

      create: {
        watchId,

        quantityOnHand:
          quantity,
      },
    });
  }

  console.log(
    "Watches and warehouse inventory created.",
  );
}

async function main(): Promise<void> {
  console.log(
    "Starting database seed...",
  );

  await seedAdmin();

  await seedSuppliers();

  await seedWatches();

  console.log(
    "Database seed completed successfully.",
  );
}

main()
  .catch(
    (
      error: unknown,
    ) => {
      console.error(
        "Database seed failed:",
        error,
      );

      process.exitCode =
        1;
    },
  )
  .finally(
    async () => {
      await prisma.$disconnect();
    },
  );