import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Najpierw znajdź wszystkie członkostwa usera
    const memberships = await prisma.channelMember.findMany({
      where: {
        userId: decoded.id,
      },
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            description: true,
            createdAt: true,
            avatarUrl: true, // Dodaj avatarUrl (lub jak się nazywa pole w Twojej bazie)
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    // Zwróć tylko kanały
    const channels = memberships.map((m) => m.channel);

    console.log("Channels found for user", decoded.id, ":", channels.length);

    return NextResponse.json({ followedChannels: channels });
  } catch (error) {
    console.error("Error fetching followed channels:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}