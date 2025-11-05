// app/api/events/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // relative import to root /lib/prisma.ts

// Pobieranie wszystkich eventów
export async function GET() {
  const events = await prisma.event.findMany();
  return NextResponse.json(events);
}

// Tworzenie nowego eventu -- walidacja i normalizacja danych
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Normalize accepted field names from the client
    const title: string | undefined = body.title;
    const description: string | undefined = body.description;
    const latitude = body.latitude !== undefined ? parseFloat(body.latitude) : undefined;
    const longitude = body.longitude !== undefined ? parseFloat(body.longitude) : undefined;
    const eventDate = body.eventDate ?? body.date;
    const maxAttendees = body.maxAttendees ?? body.maxAtendants ?? body.max_atendants;
    const creatorId: string | undefined = body.creatorId;

    // Basic validation
    if (!title || !description || latitude === undefined || longitude === undefined || !eventDate || !creatorId) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Ensure numeric conversions
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      return NextResponse.json({ error: "Latitude/longitude must be numbers" }, { status: 400 });
    }

    const eventPayload: any = {
      title,
      description,
      latitude: latitude as number,
      longitude: longitude as number,
      eventDate: new Date(eventDate),
      creatorId: String(creatorId),
    };

    if (maxAttendees !== undefined) {
      const parsed = parseInt(maxAttendees as any, 10);
      if (!Number.isNaN(parsed)) eventPayload.maxAttendees = parsed;
    }

    // Check creator exists
    const creator = await prisma.user.findUnique({ where: { id: eventPayload.creatorId } });
    if (!creator) return NextResponse.json({ error: "Creator not found" }, { status: 400 });

    const newEvent = await prisma.event.create({ data: eventPayload });
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("Error in /api/events POST:", err);
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
