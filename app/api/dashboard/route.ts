import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userEvents = await prisma.event.findMany({
      where: { creatorId: decoded.id },
    });

    if (!userEvents) return NextResponse.json({ error: "User events not found" }, { status: 404 });

    return NextResponse.json({ userEvents });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}