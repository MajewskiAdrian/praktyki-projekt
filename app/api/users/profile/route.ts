import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { name: true, email: true }, // pola do zwrócenia
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
