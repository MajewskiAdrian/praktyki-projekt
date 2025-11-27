import { NextResponse } from 'next/server';

type NominatimItem = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type?: string;
    class?: string;
    importance?: number | string;
    extratags?: Record<string, any>;
    address?: Record<string, any>;
    [k: string]: any;
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Missing query param q' }, { status: 400 });
        }

        const url =
            `https://nominatim.openstreetmap.org/search?` +
            new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: '1',
                extratags: '1',
                namedetails: '1',
                limit: '20', // pobierz więcej, potem przefiltrujemy
            }).toString();

        const resp = await fetch(url, {
            headers: {
                // zgodnie z polityką Nominatim należy dodać identyfikację aplikacji/email
                'User-Agent': 'praktyki-social-map-app/1.0 (contact@yourdomain.example)',
            },
        });

        if (!resp.ok) {
            return NextResponse.json({ error: 'Nominatim error' }, { status: 500 });
        }

        const raw = (await resp.json()) as NominatimItem[];

            // FILTR: typy reprezentujące miasta/miasta mniejsze (city, town).
            // Dodatkowo akceptujemy wpisy gdzie w address pojawia się `city` lub `town`.
            // Wykluczamy hamlet/village tylko gdy nie mamy innych wskazań, ale allow town explicitly.
            const cities = raw.filter((item) => {
                const type = item.type || '';

                // bezpośredni typ: city lub town
                if (type === 'city' || type === 'town') return true;

                // czasem informacja o typie może być w extratags
                const extratags = item.extratags || {};
                if (extratags.place === 'city' || extratags.place === 'town' || extratags.is_city === 'yes') return true;

                // lub w address (np. address.city albo address.town) — traktujemy to jako miasto/town
                const address = item.address || {};
                if ((address.city || address.town) && !['hamlet'].includes(type)) return true;

                return false;
            });

        if (!cities.length) {
            return NextResponse.json({ results: [], best: null }, { status: 200 });
        }

        // Mapujemy i wydobywamy admin_level (liczbowo). Jeśli brak => Infinity (żeby nie wygrało).
        const mapped = cities.map((item) => {
            const extratags = item.extratags || {};

            // admin_level może być w extratags albo rzadziej w namedetails
            const adminRaw =
                extratags['admin_level'] ?? item.namedetails?.admin_level ?? extratags?.adminlevel ?? null;
            const adminLevelNum = adminRaw != null ? parseInt(String(adminRaw), 10) : NaN;
            const admin_level = Number.isFinite(adminLevelNum) ? adminLevelNum : Infinity;

            const importance = item.importance != null ? parseFloat(String(item.importance)) : 0;

            return {
                id: item.place_id,
                label: item.display_name,
                lat: Number.parseFloat(item.lat),
                lng: Number.parseFloat(item.lon),
                admin_level,
                importance,
                raw: item,
            };
        });

        // Wybierz najlepszy: najmniejszy admin_level; przy remisie -> większe importance
        const best = mapped.reduce((a, b) => {
            if (a.admin_level < b.admin_level) return a;
            if (a.admin_level > b.admin_level) return b;
            return (b.importance ?? 0) > (a.importance ?? 0) ? b : a;
        }, mapped[0]);

        // usuń pola pomocnicze w results (jeśli chcesz zwracać czystszy obiekt)
        const results = mapped.map(({ raw, importance, ...rest }) => rest);

        return NextResponse.json({ results, best: { id: best.id, label: best.label, lat: best.lat, lng: best.lng, admin_level: best.admin_level } });
    } catch (err) {
        // zwracamy szczegóły w logach serwera, ale klientowi minimalna informacja
        // eslint-disable-next-line no-console
        console.error('geocode-city error', err);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
