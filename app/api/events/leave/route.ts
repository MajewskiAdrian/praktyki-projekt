import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const token = getTokenFromReq(req);
        if (!token) {
            return NextResponse.json(
                { message: "Authentication token is missing" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token);
        if (!decoded || !decoded.id) {
            return NextResponse.json(
                { message: "Invalid authentication token" },
                { status: 401 }
            );
        }
        const { eventId } = await req.json();

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });
        if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
        // Remove user from event participants
        await prisma.event.update({
            where: { id: eventId },
            data: {
                attendees: {
                    disconnect: { id: decoded.id },
                },
            },
        });
        return NextResponse.json({ message: "Left event successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}