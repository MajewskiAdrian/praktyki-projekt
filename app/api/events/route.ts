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
    const titleRaw: any = body.title;
    const descriptionRaw: any = body.description;
    const latitudeRaw: any = body.latitude;
    const longitudeRaw: any = body.longitude;
    const eventDateRaw: any = body.eventDate ?? body.date;
    const maxAttendeesRaw: any = body.maxAttendees ?? body.maxAtendants ?? body.max_atendants;
    const creatorIdRaw: any = body.creatorId;

    const errors: string[] = [];

    const title = typeof titleRaw === "string" ? titleRaw.trim() : undefined;
    if (!title) errors.push("title");

    const description = typeof descriptionRaw === "string" ? descriptionRaw.trim() : undefined;
    if (!description) errors.push("description");

    const latitude = latitudeRaw !== undefined && latitudeRaw !== null && String(latitudeRaw).trim() !== ""
      ? parseFloat(String(latitudeRaw))
      : NaN;
    if (!Number.isFinite(latitude)) errors.push("latitude");

    const longitude = longitudeRaw !== undefined && longitudeRaw !== null && String(longitudeRaw).trim() !== ""
      ? parseFloat(String(longitudeRaw))
      : NaN;
    if (!Number.isFinite(longitude)) errors.push("longitude");

    const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;
    if (!eventDate || Number.isNaN(eventDate.getTime())) errors.push("eventDate");

    const creatorId = typeof creatorIdRaw === "string" ? creatorIdRaw.trim() : undefined;
    if (!creatorId) errors.push("creatorId");

    if (errors.length > 0) {
      return NextResponse.json({ error: "Missing or invalid fields", fields: errors }, { status: 400 });
    }

    const eventPayload: any = {
      title,
      description,
      latitude,
      longitude,
      eventDate,
      creatorId: String(creatorId),
    };

    if (maxAttendeesRaw !== undefined && maxAttendeesRaw !== null && String(maxAttendeesRaw).trim() !== "") {
      const parsed = parseInt(String(maxAttendeesRaw), 10);
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
