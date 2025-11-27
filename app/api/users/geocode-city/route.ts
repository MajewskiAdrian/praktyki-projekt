import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Missing query param q' }, { status: 400 });
    }

    // 🔹 URL Nominatim
    const url =
        `https://nominatim.openstreetmap.org/search?` +
        new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            extratags: '1',
            namedetails: '1',
            limit: '10', // pobierz więcej i przefiltrujemy
        }).toString();

    const resp = await fetch(url, {
        headers: {
            'User-Agent': 'praktyki-social-map-app/1.0',
        },
    });

    if (!resp.ok) {
        return NextResponse.json({ error: 'Nominatim error' }, { status: 500 });
    }

    const raw = await resp.json();

    // 🔹 FILTROWANIE — miasta, miasteczka, wsie
    const filtered = raw.filter((item: any) => {
        // 1. place: city, town, village
        if (item.category === 'place' && ['city', 'town', 'village'].includes(item.type)) return true;

        // 2. boundary/administrative — często miasta w Nominatim
        if (item.category === 'boundary' && item.type === 'administrative') return true;

        return false;
    });

    // 🔹 wybierz max 5 wyników
    const results = filtered.slice(0, 5).map((item: any) => ({
        id: item.place_id,
        label: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
    }));

    return NextResponse.json({ results });
}
