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
import LocationSearch from "./LocationSearch";
import { getLocation, subscribe, setLocation } from '@/lib/locationStore';

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

const customIconCreated = L.icon({
  iconUrl: "/pins/custom-marker-created.png",
  iconRetinaUrl: "/pins/custom-marker-created.png",
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
      try {
        // keep current zoom (don't change zoom level), only move center
        const currentZoom = map.getZoom();
        // use flyTo for smooth movement but keep same zoom
        map.flyTo(center, currentZoom, { duration: 1.0 });
      } catch (e) {
        // fallback to setView if flyTo fails
        try { map.setView(center); } catch (err) { /* ignore */ }
      }
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
  creator?: {
    id: string;
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  } | null;
  attendees?: { id: string }[];
  isAttending?: boolean;
}

interface MapProps {
  onEventAdded?: (newEvent: MyEvent) => void;
  focusedEventId: number | null;
  searchLocation: { lat: number; lng: number } | null;
  onLocationSearch: (loc: { lat: number; lng: number }) => void;
  onEventClick: (event: MyEvent) => void;
  onCreateEventClick: (lat: number, lng: number) => void;
}

export default function Map({
  onEventAdded,
  focusedEventId,
  onLocationSearch,
  searchLocation,
  onEventClick,
  onCreateEventClick,
}: MapProps) {
  const [mounted, setMounted] = useState(false);
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [centerLocation, setCenterLocation] = useState<[number, number] | null>(() => {
    try {
      const saved = getLocation();
      return saved ? [saved.lat, saved.lng] : null;
    } catch {
      return null;
    }
  });
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

  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile', { credentials: 'include' });
        if (!res.ok) {
          if (res.status !== 401) {
            const text = await res.text().catch(() => '');
            console.error('Failed to fetch profile:', res.status, text);
          }
          return null;
        }
        const data = await res.json().catch(() => null);
        if (data?.user) {
          setProfile(data.user);
          const u = data.user as any;
          if (typeof u.latitude === 'number' && typeof u.longitude === 'number') {
            try {
              setLocation({ lat: u.latitude, lng: u.longitude });
            } catch (err) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    // initial fetch
    fetchProfile();

    // if login just happened in previous page, signal via sessionStorage to retry fetch
    try {
      const shouldFetch = sessionStorage.getItem('app:fetchProfileAfterLogin');
      if (shouldFetch) {
        sessionStorage.removeItem('app:fetchProfileAfterLogin');
        // schedule a retry after a short delay so cookies have time to be applied
        setTimeout(() => {
          fetchProfile();
        }, 300);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleEventAdded = (newEvent: MyEvent) => {
    loadEvents();
    setMarkerPosition(null);
    if (onEventAdded) onEventAdded(newEvent);
  };

  useEffect(() => {
    loadEvents();
  }, []);

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

  useEffect(() => {
    if (searchLocation) {
      setCenterLocation([searchLocation.lat, searchLocation.lng]);
      setMarkerPosition([searchLocation.lat, searchLocation.lng]);
    }
  }, [searchLocation]);

  // subscribe to client-side location updates (localStorage / BroadcastChannel)
  useEffect(() => {
    const unsub = subscribe((loc) => {
      try { console.debug && console.debug('Map received location update', loc); } catch (e) { }
      if (loc) {
        setCenterLocation([loc.lat, loc.lng]);
        // do not create a marker by default when centering from stored location
        // markerPosition is only set when user explicitly picks a marker or searchLocation prop is used
      }
    });
    return unsub;
  }, []);

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
          endpoint="/api/geocode"
          onSelectLocation={(loc) => {
            if (onLocationSearch) {
              onLocationSearch(loc);
            }
          }}
        />
      </div>
      <MapContainer
        center={centerLocation ?? [54.352, 18.6466]}
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

        {/* Mini popup with + button - marker zostaje! */}
        {markerPosition && (
          <Marker
            position={markerPosition}
            ref={markerRef}
            eventHandlers={{
              add: (e) => {
                e.target.openPopup();
              },
              // when the popup is closed (clicking the default 'x'),
              // remove the temporary marker as well
              popupclose: () => {
                setMarkerPosition(null);
              },
            }}
            icon={customIcon}
          >
            <Popup>
              <div
                style={{
                  filter: isDarkMode ? "invert(1) hue-rotate(180deg)" : "none",
                }}
                className="text-center p-3"
              >
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">
                  Wybrano lokalizację
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (markerPosition) {
                      onCreateEventClick(markerPosition[0], markerPosition[1]);
                    }
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Stwórz nowy event
                </button>
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
              event.isAttending
                ? customIconJoined
                : profile?.id === event.creator?.id
                  ? customIconCreated
                  : customIcon
            }

          >
            <Popup>
              <div
                style={{
                  filter: isDarkMode ? "invert(1) hue-rotate(180deg)" : "none",
                }}
                className="bg-white dark:bg-black p-4 rounded-xl min-w-[200px]"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {event.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {event.eventDate &&
                      new Date(event.eventDate).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    try {
                      onEventClick(event);
                    } catch (err) {
                      // ignore errors
                    }
                  }}
                  className="w-full px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Zobacz szczegóły
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
