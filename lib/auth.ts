import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function getTokenFromReq(req: NextRequest) {
  const cookieToken = req.cookies.get("token")?.value;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") return parts[1];
  return null;
}

export function verifyToken(token: string | null) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id?: string; userId?: string };
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

export async function verifyAuth(req: NextRequest): Promise<string | null> {
  try {
    console.log("=== verifyAuth START ===");

    // 1. Sprawdź Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header:", authHeader);

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      console.log("Token from header:", token.substring(0, 20) + "...");

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        console.log("Decoded token:", decoded);
        const userId = decoded.userId || decoded.id;
        console.log("userId from header:", userId);
        return userId;
      } catch (err: any) {
        console.error("Header token invalid:", err.message);
      }
    }

    // 2. Sprawdź cookie
    const cookieToken = req.cookies.get("token")?.value;
    console.log("Cookie token:", cookieToken ? cookieToken.substring(0, 20) + "..." : "null");

    if (cookieToken) {
      try {
        const decoded = jwt.verify(cookieToken, process.env.JWT_SECRET!) as any;
        console.log("Decoded cookie:", decoded);
        const userId = decoded.userId || decoded.id;
        console.log("userId from cookie:", userId);
        return userId;
      } catch (err: any) {
        console.error("Cookie token invalid:", err.message);
      }
    }

    console.log("No valid token found");
    return null;
  } catch (error) {
    console.error("verifyAuth error:", error);
    return null;
  }
}

// Pomocnicza funkcja do sprawdzania roli w kanale
export async function checkChannelRole(channelId: string, userId: string) {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const member = await prisma.channelMember.findUnique({
      where: {
        channelId_userId: { channelId, userId },
      },
    });

    return member?.role || null;
  } finally {
    await prisma.$disconnect();
  }
}
