import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
  try {
    // params may be empty in some dev runtimes — fall back to parsing URL
    console.log("attendees route called; params:", params);
    let eventId = params?.eventId ?? null;
    if (!eventId) {
      try {
        const url = new URL(req.url);
        const segments = url.pathname.split("/").filter(Boolean);
        // expected: ['api', 'events', '<id>', 'attendees'] — take penultimate
        if (segments.length >= 3) {
          eventId = segments[segments.length - 2];
        }
      } catch (e) {
        console.warn("Could not parse URL in attendees route", e);
      }
    }

    console.log("📋 Fetching attendees for event:", eventId);

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required", params: params ?? null }, { status: 400 });
    }

    // convert to number (Event.id is Int in Prisma schema)
    const idNum = Number(eventId);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
    }

    // Sprawdź czy event istnieje i pobierz attendees (users)
    const event = await prisma.event.findUnique({
      where: { id: idNum },
      include: {
        attendees: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const formattedAttendees = (event.attendees || []).map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatarUrl: u.avatarUrl,
    }));

    console.log("✅ Found attendees:", formattedAttendees.length);

    return NextResponse.json({ attendees: formattedAttendees });
  } catch (error) {
    console.error("❌ Error fetching attendees:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendees", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
