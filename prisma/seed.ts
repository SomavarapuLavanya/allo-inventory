import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const warehouse1 = await prisma.warehouse.create({
    data: {
      id: "warehouse1",
      name: "Mumbai Warehouse",
    },
  });

  const warehouse2 = await prisma.warehouse.create({
    data: {
      id: "warehouse2",
      name: "Delhi Warehouse",
    },
  });

  const product1 = await prisma.product.create({
    data: {
      id: "product1",
      name: "T-Shirt",
      description: "Black Cotton T-Shirt",
    },
  });

  const product2 = await prisma.product.create({
    data: {
      id: "product2",
      name: "Sneakers",
      description: "White Running Sneakers",
    },
  });

  await prisma.stock.createMany({
    data: [
      {
        id: "stock1",
        productId: "product1",
        warehouseId: "warehouse1",
        totalUnits: 10,
        reservedUnits: 0,
      },
      {
        id: "stock2",
        productId: "product1",
        warehouseId: "warehouse2",
        totalUnits: 5,
        reservedUnits: 0,
      },
      {
        id: "stock3",
        productId: "product2",
        warehouseId: "warehouse1",
        totalUnits: 8,
        reservedUnits: 0,
      },
    ],
  });

  console.log("Seed data inserted");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });