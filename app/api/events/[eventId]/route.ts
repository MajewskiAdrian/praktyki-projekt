import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function GET(
  req: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const params = await context.params;
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

export async function PUT(req: Request, context: { params: Promise<{ eventId: string }> }) {
  try {
  const params = await context.params;
  const { eventId } = params;
  console.log("PUT /api/events/[eventId] called, params.eventId=", eventId);
  const body = await req.json();
  console.log("PUT body:", body);

    // Basic validation
    const allowedFields: any = {};
    if (body.title !== undefined) allowedFields.title = body.title;
    if (body.description !== undefined) allowedFields.description = body.description;
    if (body.latitude !== undefined) allowedFields.latitude = body.latitude;
    if (body.longitude !== undefined) allowedFields.longitude = body.longitude;
    if (body.eventDate !== undefined) allowedFields.eventDate = new Date(body.eventDate);
    if (body.maxAttendees !== undefined) allowedFields.maxAttendees = body.maxAttendees;

    // Update tags if provided (replace existing tags)
    const updateData: any = { ...allowedFields };
    if (Array.isArray(body.tagIds)) {
      updateData.tags = body.tagIds.length
        ? { set: body.tagIds.map((id: number) => ({ id })) }
        : { set: [] };
    }

    // Try to parse numeric id from the route param first; if that's invalid,
    // fall back to an id provided in the request body (helps when the client
    // accidentally omits or misformats the route param).
    let numericId = Number(eventId);
    if (!Number.isFinite(numericId) && body?.id !== undefined) {
      const byBody = Number(body.id);
      if (Number.isFinite(byBody)) {
        numericId = byBody;
        console.log("Falling back to body.id for update:", body.id);
      }
    }

    if (!Number.isFinite(numericId)) {
      console.error("Invalid eventId for update (route param and body.id are invalid):", eventId, body?.id);
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    console.log("Updating event id:", numericId, "with data:", updateData);

    const updated = await prisma.event.update({
      where: { id: numericId },
      data: updateData,
      include: { tags: true, creator: true },
    });

    return NextResponse.json({ event: updated });
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 });
  }
}