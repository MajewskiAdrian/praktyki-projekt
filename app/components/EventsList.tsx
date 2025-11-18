"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";

interface Event {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
}

interface EventsListProps {
  onEventClick: (eventId: number) => void;
}

export default function EventsList({ onEventClick }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("/api/events")
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Błąd serwera");
        }
        return res.json();
      })
      .then((data) => setEvents(data))
      .catch((err: any) => {
        console.error("❌ Fetch error:", err);
        setError("Failed to load events.");
        setEvents([]); // żeby map nie wysypywało
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading events...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="relative h-full w-full">
      {/* LISTA */}
      <ul
        className={`space-y-2 p-4 overflow-y-auto h-full transition-all ${
          selectedEvent ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {events.length === 0 && <p>No events to display.</p>}

        {events.map((event) => (
          <li
            key={event.id}
            onClick={() => {
              setSelectedEvent(event);
              onEventClick(event.id);
            }}
            className="bg-white dark:bg-gray-700 p-4 rounded shadow hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
          >
            <h3 className="font-bold text-lg text-black dark:text-white">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              📅 {new Date(event.eventDate).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>

      {/* MODAL */}
      {selectedEvent && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-[90%] max-h-[90%] overflow-y-auto scrollbar-hide">
            <EventData
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
