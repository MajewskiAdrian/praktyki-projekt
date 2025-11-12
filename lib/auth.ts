// app/lib/auth.ts
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
