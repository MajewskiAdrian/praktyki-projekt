import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        const token = getTokenFromReq(req);
        if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const joinedEvents = await prisma.event.findMany({
            where: { attendees: { some: { id: decoded.id } } },
            include: { tags: true, creator: { select: { id: true, name: true, email: true, avatarUrl: true } } },
        });

        if (!joinedEvents) return NextResponse.json({ error: "Events joined by user not found" }, { status: 404 });

        return NextResponse.json({ joinedEvents }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}