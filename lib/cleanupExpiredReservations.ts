import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanupExpiredReservations() {
  const expired = await prisma.reservation.findMany({
    where: {
      status: "pending",
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  for (const reservation of expired) {
    await prisma.$transaction(async (tx) => {
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          reservedUnits: {
            decrement: reservation.quantity,
          },
        },
      });

      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: "released" },
      });
    });
  }
}