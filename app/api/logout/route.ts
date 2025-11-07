import { NextResponse } from "next/server";

export async function POST() {
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`;
  return NextResponse.json({ message: "Logged out successfully" }, { headers: { "Set-Cookie": cookie } });
}