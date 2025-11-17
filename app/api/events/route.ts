import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Dodaj metodę GET do pobierania eventów
export async function GET(req: Request) {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: 'desc' },
    });
    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Error in GET /api/events:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Received body:", body);

    // Walidacja
    const missing: string[] = [];
    if (!body.title) missing.push("title");
    if (!body.description) missing.push("description");
    if (body.latitude == null) missing.push("latitude");
    if (body.longitude == null) missing.push("longitude");
    if (!body.eventDate) missing.push("eventDate");

    if (missing.length) {
      return NextResponse.json({ error: "Missing fields", fields: missing }, { status: 400 });
    }

    // Token
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader.split("; ").find((c) => c.startsWith("token="));
    const tokenValue = tokenCookie?.split("=")[1];
    const secret = process.env.JWT_SECRET;

    if (!tokenValue || !secret) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    let creatorId: string;
    try {
      const decoded = jwt.verify(tokenValue, secret) as { id: string };
      creatorId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 🔥 TU BYŁ BRAK — zapis eventu!
    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        eventDate: new Date(body.eventDate),
        creatorId,
      },
    });

    console.log("✅ Event created:", newEvent);

    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("❌ Error in POST /api/events:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
