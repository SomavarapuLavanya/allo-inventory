import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { productId, warehouseId, quantity } = await req.json();

  if (!productId || !warehouseId || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const reservation = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const stock = await tx.stock.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      });

      if (!stock || stock.totalUnits - stock.reservedUnits < quantity) {
        throw new Error("NOT_ENOUGH_STOCK");
      }

      await tx.stock.update({
        where: { id: stock.id },
        data: {
          reservedUnits: { increment: quantity },
        },
      });

      return tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          status: "pending",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      });
    });

    return NextResponse.json(reservation);
  } catch {
    return NextResponse.json(
      { error: "Not enough stock available" },
      { status: 409 }
    );
  }
}