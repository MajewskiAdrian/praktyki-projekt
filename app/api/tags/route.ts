import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Pobieranie wszystkich tagów
export async function GET() {
  try {
    const tags = await (prisma as any).tag.findMany();
    return NextResponse.json(tags);
  } catch (err) {
    return NextResponse.json(
      { error: "Server error fetching tags", details: String(err) },
      { status: 500 }
    );
  }
}

