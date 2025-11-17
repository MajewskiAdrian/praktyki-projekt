import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query param q' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/search?` +
    new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: '5',
    }).toString();

  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'praktyki-social-map-app/1.0',
    },
  });

  if (!resp.ok) {
    return NextResponse.json({ error: 'Nominatim error' }, { status: 500 });
  }

  const data = await resp.json();

  const results = (data || []).map((item: any) => ({
    id: item.place_id,
    label: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));

  return NextResponse.json({ results });
}