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
import LocationSearch from "./LocationSearch";

// Własne ikony
const customIcon = L.icon({
  iconUrl: "/pins/custom-marker.png",
  iconRetinaUrl: "/pins/custom-marker.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customIconJoined = L.icon({
  iconUrl: "/pins/custom-marker-joined.png",
  iconRetinaUrl: "/pins/custom-marker-joined.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

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

    const t = setTimeout(revalidate, 100);
    const container = map.getContainer();
    const ro = new ResizeObserver(() => {
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

function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

interface MyEvent {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
}

interface MapProps {
  onEventAdded?: (newEvent: MyEvent) => void;
  focusedEventId: number | null;
  searchLocation: { lat: number; lng: number } | null;
  onLocationSearch: (loc: { lat: number; lng: number }) => void;
  onEventClick: (event: MyEvent) => void; // ← nowy typ
}

export default function Map({
  onEventAdded,
  focusedEventId,
  onLocationSearch,
  searchLocation,
  onEventClick,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [centerLocation, setCenterLocation] = useState<[number, number] | null>(
    null
  );
  const markerRef = useRef<L.Marker | null>(null);
  const markerRefs = useRef<{ [key: number]: L.Marker }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const loadEvents = () => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEvents(data);
        } else if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn("Unexpected events data format:", data);
          return;
        }
      })
      .catch((err) => console.error("Failed to load events:", err));
  };

  const handleEventAdded = (newEvent: MyEvent) => {
    loadEvents(); // załaduj wszystkie eventy
    setMarkerPosition(null);
    if (onEventAdded) onEventAdded(newEvent); // przekaż nowy event do parenta
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Focus na evencie gdy focusedEventId się zmieni
  useEffect(() => {
    if (focusedEventId) {
      const event = events.find((e) => e.id === focusedEventId);
      if (event) {
        setCenterLocation([event.latitude, event.longitude]);

        setTimeout(() => {
          const marker = markerRefs.current[focusedEventId];
          if (marker) {
            marker.openPopup();
          }
        }, 1600);
      }
    }
  }, [focusedEventId, events]);

  // Obsługa wyszukiwania lokalizacji
  useEffect(() => {
    if (searchLocation) {
      setCenterLocation([searchLocation.lat, searchLocation.lng]);
      setMarkerPosition([searchLocation.lat, searchLocation.lng]);
    }
  }, [searchLocation]);

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

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [markerPosition]);

  if (!mounted) return <div className="w-full h-full rounded-lg z-0" />;

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-1000 w-full max-w-md px-4">
        <LocationSearch
          onSelectLocation={(loc) => {
            if (onLocationSearch) {
              onLocationSearch(loc);
            }
          }}
        />
      </div>
      <MapContainer
        center={[54.352, 18.6466]}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full rounded-lg z-0"
        style={{
          filter: isDarkMode ? "invert(1) hue-rotate(180deg)" : "none",
        }}
        minZoom={3}
        maxBounds={[
          [85, -180],
          [-85, 180],
        ]}
        maxBoundsViscosity={0.8}
      >
        <MapController center={centerLocation} />
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
        {markerPosition && (
          <Marker
            position={markerPosition}
            ref={markerRef}
            eventHandlers={{
              add: (e) => {
                e.target.openPopup();
              },
            }}
            icon={customIcon}
          >
            <Popup>
              <div
                style={{
                  filter: isDarkMode ? "invert(1) hue-rotate(180deg)" : "none",
                }}
              >
                <AddEventForm
                  lat={markerPosition[0]}
                  lng={markerPosition[1]}
                  onEventAdded={handleEventAdded}
                />
              </div>
            </Popup>
          </Marker>
        )}

        {events.map((event) => (
          <Marker
            key={event.id}
            position={[event.latitude, event.longitude]}
            ref={(ref) => {
              if (ref) {
                markerRefs.current[event.id] = ref;
              }
            }}
            icon={
              focusedEventId === event.id ? customIconJoined : customIcon
            }
          >
            <Popup>
              <div
                style={{
                  filter: isDarkMode ? "invert(1) hue-rotate(180deg)" : "none",
                }}
                className="bg-white dark:bg-gray-700 p-4 rounded shadow hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
              >
                <strong>{event.title}</strong>
                <br />

                <button
                  onClick={() => onEventClick(event)}
                  className="mt-2 px-3 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                >
                  Details
                </button>

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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
