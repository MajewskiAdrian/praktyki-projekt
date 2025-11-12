"use client";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import AddEventForm from "./AddEventForm";

// poprawa błędu z domyślną ikoną Leaflet w Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

    window.addEventListener("resize", revalidate);

    return () => {
      clearTimeout(t);
      ro.disconnect();
      window.removeEventListener("resize", revalidate);
    };
  }, [map]);

  return null;
}

export default function Map({ onEventAdded }: { onEventAdded?: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Function to load events - DON'T call onEventAdded here
  const loadEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        // Upewnij się, że to tablica:
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn("Unexpected events data format:", data);
          // nie nadpisuj events — zostaw poprzednie dane
          return;
        }
      })
      .catch((err) => console.error("Failed to load events:", err));
  };

  // Wrapper function that loads events AND notifies parent - ONLY use this after adding event
  const handleEventAdded = () => {
    loadEvents();
    if (onEventAdded) onEventAdded();
  };

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Komponent do obsługi kliknięć na mapie
  function LocationPicker({
    onSelect,
  }: {
    onSelect: (lat: number, lng: number) => void;
  }) {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        onSelect(lat, lng);
      },
    });

    return null;
  }

  // Otwórz popup po pojawieniu się markera
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [markerPosition]);

  if (!mounted) return <div className="w-full h-full rounded-lg z-0" />;

  return (
    <MapContainer
      center={[54.352, 18.6466]} // Gdańsk
      zoom={11}
      scrollWheelZoom={true}
      className="w-full h-full rounded-lg z-0"
      minZoom={3}
      maxBounds={[
        [85, -180], // północny zachód (górny lewy róg)
        [-85, 180], // południowy wschód (dolny prawy róg)
      ]}
      maxBoundsViscosity={0.8}
    >
      <ResizeRevalidator />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <LocationPicker
        onSelect={(lat, lng) => {
          setMarkerPosition([lat, lng]);
        }}
      />
      {/* Marker wybranego miejsca */}
      {markerPosition && (
        <Marker
          position={markerPosition}
          ref={markerRef}
          eventHandlers={{
            add: (e) => {
              // Otwórz popup natychmiast po dodaniu markera do mapy
              e.target.openPopup();
            },
          }}
        >
          <Popup autoClose={false}>
            <AddEventForm
              lat={markerPosition[0]}
              lng={markerPosition[1]}
              onEventAdded={handleEventAdded}
            />
          </Popup>
        </Marker>
      )}

      {/* Pineski z eventów */}
      {events.map((event) => (
        <Marker key={event.id} position={[event.latitude, event.longitude]}>
          <Popup>
            <strong>{event.title}</strong>
            <br />
            {event.description}
            <br />
            <small>
              {event.eventDate &&
                new Date(event.eventDate).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </small>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
