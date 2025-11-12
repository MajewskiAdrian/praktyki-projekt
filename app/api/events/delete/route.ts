import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function DELETE(req: Request) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Server error: JWT secret not configured" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { id: string };
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Get the event ID from the request body
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    // Find the event and verify ownership
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if the user owns the event (use creatorId, not userId)
    if (event.creatorId !== decoded.id) {
      return NextResponse.json(
        { 
          error: "You are not authorized to delete this event"
        },
        { status: 403 }
      );
    }

    // Delete the event
    await prisma.event.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}