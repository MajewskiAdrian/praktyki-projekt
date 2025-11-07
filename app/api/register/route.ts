import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // relative import to root /lib/prisma.ts
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("/api/register body:", JSON.stringify(body));
    const { name, email, password } = body;

    // Validate input
    const errors: string[] = [];
    if (typeof name !== "string" || name.trim() === "") {
      errors.push("name");
    }
    if (typeof email !== "string" || email.trim() === "") {
      errors.push("email");
    }
    if (typeof password !== "string" || password.trim() === "") {
      errors.push("password");
    }
    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Missing fields: ${errors.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    // Create new user
    // NOTE: consider hashing the password before storing in production
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData: any = { name, email, password: hashedPassword };
    console.log("Creating user with:", {
      name,
      email,
      hasPassword: !!password,
    });
    const newUser = await prisma.user.create({
      data: userData,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error("Error registering user:", error?.message ?? error);
    const safeMessage =
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : error?.message ?? String(error);
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
