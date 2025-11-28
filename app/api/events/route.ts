import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

// Funkcja pomocnicza do usuwania starych eventów
async function cleanupOldEvents() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Najpierw znajdź eventy do usunięcia wraz z ich channelId
    const eventsToDelete = await prisma.event.findMany({
      where: {
        eventDate: {
          lt: twentyFourHoursAgo,
        },
      },
      select: {
        id: true,
        channelId: true,
      },
    });

    if (eventsToDelete.length > 0) {
      // Zbierz channelId z eventów, które będą usunięte
      const channelIds = eventsToDelete
        .filter(e => e.channelId !== null)
        .map(e => e.channelId as string);

      // Usuń eventy
      const deletedEvents = await prisma.event.deleteMany({
        where: {
          eventDate: {
            lt: twentyFourHoursAgo,
          },
        },
      });

      // Usuń powiązane channele
      if (channelIds.length > 0) {
        const deletedChannels = await prisma.channel.deleteMany({
          where: {
            id: {
              in: channelIds,
            },
          },
        });
        
        console.log(`🗑️ Cleaned up ${deletedEvents.count} old events and ${deletedChannels.count} associated channels`);
      } else {
        console.log(`🗑️ Cleaned up ${deletedEvents.count} old events`);
      }
    }
  } catch (error) {
    console.error("❌ Error cleaning up old events:", error);
  }
}

export async function GET(req: Request) {
  try {
    // Automatyczne czyszczenie starych eventów
    await cleanupOldEvents();

    // try to extract user id from cookie token if present
    const cookieHeader = (req.headers.get("cookie") || "");
    const tokenCookie = cookieHeader.split("; ").find((c) => c.startsWith("token="));
    const tokenValue = tokenCookie?.split("=")[1] || null;

    let userId: string | null = null;
    const secret = process.env.JWT_SECRET;
    if (tokenValue && secret) {
      try {
        const decoded = jwt.verify(tokenValue, secret) as any;
        userId = decoded?.id || decoded?.userId || null;
      } catch (e) {
        // invalid token, ignore — we'll just return events without isAttending
        console.warn("Invalid token in GET /api/events");
      }
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: "desc" },
      include: {
        creator: { select: { id: true, name: true, email: true, avatarUrl: true } },
        tags: true,
        attendees: { select: { id: true } },
      }, // pobieramy też creator, tags i attendees (tylko id)
    });

    // add isAttending flag for current user if we have userId
    const eventsWithFlag = events.map((e) => ({
      ...e,
      isAttending: !!userId && e.attendees?.some((a: any) => String(a.id) === String(userId)),
    }));

    console.log("🔹 Events fetched:", eventsWithFlag);
    return NextResponse.json(eventsWithFlag);
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

    // Sprawdź czy data eventu nie jest w przeszłości
    const eventDate = new Date(body.eventDate);
    const now = new Date();
    
    if (eventDate < now) {
      return NextResponse.json(
        { error: "Event date cannot be in the past" },
        { status: 400 }
      );
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
        eventDate: eventDate,
        creatorId,
        maxAttendees: body.maxAttendees ?? undefined,
        // save optional address fields coming from reverse-geocode
        address: body.address ?? null,
        neighborhood: body.neighborhood ?? null,
        city: body.city ?? null,
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
