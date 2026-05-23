import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
  });

  if (!reservation) {
    return NextResponse.json(
      { error: "Reservation not found" },
      { status: 404 }
    );
  }

  if (reservation.status !== "pending") {
    return NextResponse.json(reservation);
  }

  if (reservation.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Reservation expired" },
      { status: 410 }
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.stock.update({
      where: {
        productId_warehouseId: {
          productId: reservation.productId,
          warehouseId: reservation.warehouseId,
        },
      },
      data: {
        totalUnits: {
          decrement: reservation.quantity,
        },
        reservedUnits: {
          decrement: reservation.quantity,
        },
      },
    });

    return tx.reservation.update({
      where: { id },
      data: {
        status: "confirmed",
      },
    });
  });

  return NextResponse.json(updated);
}