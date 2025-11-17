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
  onEventClick?: (eventId: number) => void;
}

export default function EventsList({ onEventClick }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error(err));
  }, []);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event.id);
    }
  };

  return (
    <div className="relative h-full">
      <ul className="space-y-2 p-4">
        {events.map((event) => (
          <li
            key={event.id}
            onClick={() => handleEventClick(event)}
            className="bg-white dark:bg-gray-700 p-4 rounded shadow hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
          >
            <h3 className="font-bold text-lg text-black dark:text-white">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              📅{" "}
              {new Date(event.eventDate).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </li>
        ))}
      </ul>

      {selectedEvent && (
        <EventData event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
