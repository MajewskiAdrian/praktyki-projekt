import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?` +
    new URLSearchParams({
      lat: lat,
      lon: lng,
      format: 'json',
      addressdetails: '1',
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

  const label = data.display_name ?? `${lat}, ${lng}`;

  return NextResponse.json({ label });
}