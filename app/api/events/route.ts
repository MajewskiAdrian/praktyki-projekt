import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { eventDate: "desc" },
      include: { creator: {select: {id: true, name: true, email: true} }, tags: true }, // pobieramy też creator
    });
    console.log("🔹 Events fetched:", events);
    return NextResponse.json(events);
  } catch (err: any) {
    console.error("❌ Error in GET /api/events:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📥 Received body:", body);

    const missing: string[] = [];
    if (!body.title) missing.push("title");
    if (!body.description) missing.push("description");
    if (body.latitude == null) missing.push("latitude");
    if (body.longitude == null) missing.push("longitude");
    if (!body.eventDate) missing.push("eventDate");

    if (missing.length) {
      return NextResponse.json({ error: "Missing fields", fields: missing }, { status: 400 });
    }

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

    const newEvent = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        eventDate: new Date(body.eventDate),
        creatorId,
        maxAttendees: body.maxAttendees ?? undefined,
        tags: body.tagIds?.length
          ? ({ connect: body.tagIds.map((id: number) => ({ id })) } as any)
          : undefined,
      },
      include: { creator: true },
    });

    console.log("✅ Event created:", newEvent);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (err: any) {
    console.error("❌ Error in POST /api/events:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}
