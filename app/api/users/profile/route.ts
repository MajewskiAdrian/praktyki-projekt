import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromReq, verifyToken } from "@/lib/auth";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

function validateUsername(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null; // brak zmiany
  if (typeof raw !== "string") return "Nieprawidłowy typ username";
  const v = raw.trim();
  if (v.length < 3 || v.length > 32) return "Username musi mieć 3-32 znaki";
  if (!/^[a-z0-9._-]+$/i.test(v)) return "Dozwolone: litery, cyfry, ., _, -";
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const userId = decoded.id;

    // Znajdź część, gdzie pobierasz użytkownika z bazy
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        trueName: true,
        bio: true,
        avatarUrl: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromReq(req);
    if (!token) return NextResponse.json({ error: "Token not found" }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded?.id) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    let body: any = {};
    let avatarFile: File | null = null;
    let shouldRemoveAvatar = false;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      body = {
        name: formData.get("name"),
        trueName: formData.get("trueName"),
        bio: formData.get("bio"),
      };
      avatarFile = formData.get("avatar") as File | null;
      shouldRemoveAvatar = formData.get("removeAvatar") === "true";
    } else {
      body = await req.json().catch(() => ({}));
    }

    const { name, trueName, bio } = body;

    const nameErr = validateUsername(name);
    if (name !== undefined && nameErr)
      return NextResponse.json({ error: nameErr, field: "name" }, { status: 400 });

    if (trueName !== undefined && typeof trueName !== "string" && trueName !== null)
      return NextResponse.json({ error: "Invalid trueName", field: "trueName" }, { status: 400 });

    if (bio !== undefined && typeof bio !== "string" && bio !== null)
      return NextResponse.json({ error: "Invalid bio", field: "bio" }, { status: 400 });

    const data: any = {};
    if (name !== undefined) data.name = (name as string).trim();
    if (trueName !== undefined) data.trueName = (trueName as string | null) ?? null;
    if (bio !== undefined) data.bio = (bio as string | null) ?? null;

    // Sprawdź unikalność username
    if (data.name) {
      const exists = await prisma.user.findFirst({
        where: { name: data.name, NOT: { id: decoded.id } },
        select: { id: true },
      });
      if (exists) return NextResponse.json({ error: "Username jest zajęty", field: "name" }, { status: 409 });
    }

    // Obsługa avatara
    if (shouldRemoveAvatar) {
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { avatarUrl: true } });
      if (user?.avatarUrl) {
        const oldPath = join(process.cwd(), "public", user.avatarUrl);
        if (existsSync(oldPath)) {
          await unlink(oldPath).catch(console.error);
        }
      }
      data.avatarUrl = null;
    } else if (avatarFile && avatarFile.size > 0) {
      // Walidacja pliku
      if (avatarFile.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Avatar max 2MB" }, { status: 400 });
      }
      if (!avatarFile.type.startsWith("image/")) {
        return NextResponse.json({ error: "Avatar must be an image" }, { status: 400 });
      }

      // Usuń stary avatar
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { avatarUrl: true } });
      if (user?.avatarUrl) {
        const oldPath = join(process.cwd(), "public", user.avatarUrl);
        if (existsSync(oldPath)) {
          await unlink(oldPath).catch(console.error);
        }
      }

      // Zapisz nowy
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const filename = `${decoded.id}-${Date.now()}.${ext}`;
      const filepath = join(process.cwd(), "public", "avatars", filename);
      await writeFile(filepath, buffer);
      data.avatarUrl = `/avatars/${filename}`;
    }

    // miasto
    if (body.city !== undefined) {
      if (typeof body.city !== "string" && body.city !== null) {
        return NextResponse.json({ error: "Invalid city", field: "city" }, { status: 400 });
      }
      data.city = (body.city as string | null) ?? null;
    }


    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data,
      select: { id: true, name: true, email: true, trueName: true, bio: true, avatarUrl: true, city: true, latitude: true, longitude: true },
    });

    return NextResponse.json({ user: updated });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Username jest zajęty", field: "name" }, { status: 409 });
    }
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
