import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // relative import to root /lib/prisma.ts
import jwt from "jsonwebtoken";

// Pobieranie wszystkich eventów
export async function GET() {
  try {
    const events = await prisma.event.findMany();
    return NextResponse.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    return NextResponse.json(
      { error: "Server error fetching events" },
      { status: 500 }
    );
  }
}

// Tworzenie nowego eventu -- walidacja i normalizacja danych
export async function POST(req: Request) {
  const body = await req.json();

  // prosta walidacja i czytelny komunikat (tymczasowe)
  const missing = [];
  if (!body.title) missing.push("title");
  if (!body.description) missing.push("description");
  if (body.latitude == null) missing.push("latitude");
  if (body.longitude == null) missing.push("longitude");
  if (!body.eventDate) missing.push("eventDate");
  if (missing.length) {
    console.error("Validation failed, missing fields:", missing);
    return NextResponse.json(
      { error: "Missing or invalid fields", fields: missing },
      { status: 400 }
    );
  }

  try {
    const titleRaw: any = body.title;
    const descriptionRaw: any = body.description;
    const latitudeRaw: any = body.latitude;
    const longitudeRaw: any = body.longitude;
    const eventDateRaw: any = body.eventDate ?? body.date;
    const maxAttendeesRaw: any =
      body.maxAttendees ?? body.maxAtendants ?? body.max_atendants;
    const creatorIdRaw: string = body.creatorId; // do sprawdzenia

    const errors: string[] = [];

    const title = typeof titleRaw === "string" ? titleRaw.trim() : undefined;
    if (!title) errors.push("title");

    const description =
      typeof descriptionRaw === "string" ? descriptionRaw.trim() : undefined;
    if (!description) errors.push("description");

    const latitude =
      latitudeRaw !== undefined &&
      latitudeRaw !== null &&
      String(latitudeRaw).trim() !== ""
        ? parseFloat(String(latitudeRaw))
        : NaN;
    if (!Number.isFinite(latitude)) errors.push("latitude");

    const longitude =
      longitudeRaw !== undefined &&
      longitudeRaw !== null &&
      String(longitudeRaw).trim() !== ""
        ? parseFloat(String(longitudeRaw))
        : NaN;
    if (!Number.isFinite(longitude)) errors.push("longitude");

    const eventDate = eventDateRaw ? new Date(eventDateRaw) : null;
    if (!eventDate || Number.isNaN(eventDate.getTime()))
      errors.push("eventDate");

    // Pobierz token z ciasteczka w bezpieczny sposób
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("token="));
    const tokenValue = tokenCookie ? tokenCookie.split("=")[1] : null;
    const secret = process.env.JWT_SECRET;

    if (!tokenValue || !secret) {
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 401 }
      );
    }

    let creatorId: string | null = null;
    try {
      const decoded = jwt.verify(tokenValue, secret) as { id: string };
      creatorId = decoded.id;
    } catch (err) {
      console.error("JWT verify error:", err);
      return NextResponse.json(
        { error: "Invalid or missing token" },
        { status: 401 }
      );
    }

    if (!creatorId) errors.push("creatorId");

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields", fields: errors },
        { status: 400 }
      );
    }

    const eventPayload: any = {
      title,
      description,
      latitude,
      longitude,
      eventDate,
      creatorId: String(creatorId),
    };

    if (
      maxAttendeesRaw !== undefined &&
      maxAttendeesRaw !== null &&
      String(maxAttendeesRaw).trim() !== ""
    ) {
      const parsed = parseInt(String(maxAttendeesRaw), 10);
      if (!Number.isNaN(parsed)) eventPayload.maxAttendees = parsed;
    }

    // Check creator exists
    const creator = await prisma.user.findUnique({
      where: { id: eventPayload.creatorId },
    });
    if (!creator)
      return NextResponse.json({ error: "Creator not found" }, { status: 400 });

    const newEvent = await prisma.event.create({ data: eventPayload });
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("Error in /api/events POST:", err);
    return NextResponse.json(
      { error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
