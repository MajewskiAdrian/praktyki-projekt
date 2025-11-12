// app/api/users/theme/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

function getTokenFromReq(req: NextRequest) {
  // najpierw sprawdź cookie
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  // potem nagłówek Authorization: Bearer <token>
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

function verifyToken(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string };
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    // obsłuż różne nazwy pola (id lub userId)
    const userId = (decoded as any).id || (decoded as any).userId;
    if (!userId) return NextResponse.json({ error: "No user id in token" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { theme: true },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ theme: user.theme || "light" });
  } catch (err) {
    console.error("Error while loading theme:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = (decoded as any).id || (decoded as any).userId;
    if (!userId) return NextResponse.json({ error: "No user id in token" }, { status: 401 });

    const body = await req.json();
    const { theme } = body;

    if (!["light", "dark"].includes(theme)) {
      return NextResponse.json({ error: "Invalid theme value" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { theme },
      select: { theme: true },
    });

    return NextResponse.json({ success: true, theme: updatedUser.theme });
  } catch (err) {
    console.error("Error while changing theme:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
