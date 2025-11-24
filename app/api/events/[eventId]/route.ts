import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        tags: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
      { status: 500 }
    );
  }
}