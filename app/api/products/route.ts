import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { cleanupExpiredReservations } from "@/lib/cleanupExpiredReservations";
const prisma = new PrismaClient();

export async function GET() {
  await cleanupExpiredReservations();

  const products = await prisma.product.findMany({
    include: {
      stocks: {
        include: {
          warehouse: true,
        },
      },
    },
  });

  return NextResponse.json(products);
}