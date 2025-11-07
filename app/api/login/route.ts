import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  if (!email || !password)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User does not exist" }, { status: 404 });
  }
  if (!user.password) {
    return NextResponse.json(
      { error: "User has no password set" },
      { status: 400 }
    );
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Server error: JWT secret not configured" },
      { status: 500 }
    );
  }

  const token = jwt.sign(
    { id: user.id },
    secret,
    { expiresIn: "1d" }
  );

  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; Secure`;

  return NextResponse.json(
    { message: "Login Succesful" },
    {
      status: 200,
      headers: {
        "Set-Cookie": cookie,
      },
    }
  );
}
