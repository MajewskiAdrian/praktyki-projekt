"use client";
import { useEffect, useState } from "react";

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);

  if (loading) return <p>Loading events...</p>;

  return (
    <div>
      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <ul>
          {events.map((event) => (
            <div key={event.id} className="p-4 border-gray-400 m-1 bg-gray-50 rounded-lg shadow-2xl-sm">
                <p className="text-xl text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-600">{event.description}</p>
                <p className="text-xs text-gray-600">
                    📍 {event.latitude}, {event.longitude}
                </p>
                <p className="text-xs text-gray-600">
                    🗓️ {new Date(event.eventDate).toLocaleString()}
                </p>
            </div>

          ))}
        </ul>
      )}
    </div>
  );
}
