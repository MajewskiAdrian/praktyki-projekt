import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const segments = url.pathname.split("/");
    const eventId = segments[segments.length - 2]; // przed "attendees"
    
    console.log("🔍 Event ID extracted:", eventId);

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    const maxAttendees = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: { maxAttendees: true },
    });

    const attendees = await prisma.user.findMany({
      where: { attending: { some: { id: Number(eventId) } } },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ attendees, maxAttendees });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
