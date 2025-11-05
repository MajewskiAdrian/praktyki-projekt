'use client';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// poprawa błędu z domyślną ikoną Leaflet w Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Revalidator: obserwuje rozmiar kontenera i wymusza przeliczenie rozmiaru mapy
function ResizeRevalidator() {
  const map = useMap();
  useEffect(() => {
    if (!map) return;

    const revalidate = () => {
      try {
        map.invalidateSize();
      } catch (e) {
        // ignore
      }
    };

    // pierwotne przeliczenie po mount (HMR może zostawić stary stan)
    const t = setTimeout(revalidate, 100);

    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
      // wywołaj natychmiastowo (można dodać debounce jeśli potrzeba)
      revalidate();
    });
    if (container) ro.observe(container);

    window.addEventListener('resize', revalidate);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', revalidate);
    };
  }, [map]);

  return null;
}

export default function Map() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full rounded-lg z-0" />;

  return (
    <MapContainer
      center={[54.3520, 18.6466]} // Gdańsk
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg z-0"
    >
      <ResizeRevalidator />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[54.3520, 18.6466]}>
        <Popup>Gdańsk</Popup>
      </Marker>
    </MapContainer>
  );
}
