import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // dostosuj ścieżkę
import { verifyAuth } from '@/lib/auth'; // Twoja funkcja z JWT

export async function POST(req: NextRequest) {
    try {
        // 1️⃣ Pobierz userId z auth
        const userId = await verifyAuth(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2️⃣ Pobierz dane z body
        const body = await req.json();
        const { city, latitude, longitude } = body;

        // 3️⃣ Walidacja
        if (!city || typeof latitude !== 'number' || typeof longitude !== 'number') {
            return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
        }

        // 4️⃣ Aktualizacja usera w Prisma
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                city,
                latitude,
                longitude,
            },
        });

        // 5️⃣ Zwrócenie sukcesu
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
