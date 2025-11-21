import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();

    // Użyj 'token' zamiast 'session_token'
    const sessionToken = cookieStore.get("token")?.value;
    console.log("Session token found:", !!sessionToken);

    if (!sessionToken) {
      console.log("ERROR: No session token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: { user: true },
    });

    console.log("Session found:", !!session);
    console.log("User ID:", session?.userId);

    if (!session || !session.user) {
      console.log("ERROR: Invalid session");
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Pobierz kanały przez relację members
    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            userId: session.userId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
      },
    });

    console.log("Channels found:", channels.length);

    return NextResponse.json({ followedChannels: channels });
  } catch (error) {
    console.error("Error fetching followed channels:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}