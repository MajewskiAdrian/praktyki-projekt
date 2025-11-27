import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);

    // Jeśli brak zalogowanego użytkownika, zwróć pustą listę zamiast 500
    if (!userId) {
      return NextResponse.json({ followedChannels: [] }, { status: 200 });
    }

    const memberships = await prisma.channelMember.findMany({
      where: { userId },
      include: {
        channel: {
          select: {
            id: true,
            title: true,
            description: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    const followedChannels = memberships
      .map((m) => m.channel)
      .filter(Boolean);

    return NextResponse.json({ followedChannels }, { status: 200 });
  } catch (err: any) {
    console.error("GET /users/channels/followed error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}