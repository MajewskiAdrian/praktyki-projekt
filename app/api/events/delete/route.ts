import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }

    // Weryfikacja tokenu
    const cookieHeader = req.headers.get("cookie") || "";
    const tokenCookie = cookieHeader.split("; ").find((c) => c.startsWith("token="));
    const tokenValue = tokenCookie?.split("=")[1];
    const secret = process.env.JWT_SECRET;

    if (!tokenValue || !secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(tokenValue, secret) as { id: string };
      userId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Znajdź event i sprawdź, czy użytkownik jest jego twórcą
    const event = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true, channelId: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.creatorId !== userId) {
      return NextResponse.json(
        { error: "You can only delete your own events" },
        { status: 403 }
      );
    }

    // Usuń event
    await prisma.event.delete({
      where: { id },
    });

    // Jeśli event miał powiązany channel, usuń go również
    if (event.channelId) {
      try {
        await prisma.channel.delete({
          where: { id: event.channelId },
        });
        console.log(`✅ Event and associated channel deleted: ${id}, ${event.channelId}`);
      } catch (channelError) {
        console.error("❌ Error deleting associated channel:", channelError);
        // Event został już usunięty, więc zwracamy sukces mimo błędu z chanelem
      }
    } else {
      console.log(`✅ Event deleted: ${id}`);
    }

    return NextResponse.json({ 
      message: "Event deleted successfully",
      channelDeleted: !!event.channelId 
    });
  } catch (err: any) {
    console.error("❌ Error in DELETE /api/events/delete:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 }
    );
  }
}