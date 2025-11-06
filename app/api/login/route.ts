import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const body = await req.json();
    const { email, password } = body;
    
    if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const user = await prisma.user.findUnique({where: { email }});
    if (!user) {
        return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }
    if (!user.password) {
        return NextResponse.json({ error: "User has no password set" }, { status: 400 });
    }
    
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    return NextResponse.json({ user });
}

