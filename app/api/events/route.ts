// app/api/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // własny plik z klientem

// Pobieranie wszystkich eventów
export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

// Tworzenie nowego eventu
export async function POST(req: Request) {
  const data = await req.json();
  const newEvent = await prisma.event.create({ data });
  return NextResponse.json(newEvent, { status: 201 });
}
