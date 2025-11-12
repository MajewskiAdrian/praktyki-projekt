"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";
import DeleteEventButton from "./DeleteEventButton";

export default function EventsList() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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
    <div className="relative h-full overflow-auto scrollbar-hide">
     {selectedEvent ? (
       <EventData 
         event={selectedEvent} 
         onClose={() => setSelectedEvent(null)} 
       />
     ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-black dark:text-white p-4">
             Upcoming Events
           </h2>
          
          {events.length === 0 ? (
            <p className="p-4">No events found.</p>
          ) : (
            <ul>
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 border-gray-400 m-1 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div 
                    className="cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <p className="text-xl text-gray-900 dark:text-gray-100">{event.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      📍 {event.latitude}, {event.longitude}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      🗓️{" "}
                      {new Date(event.eventDate).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  
                  
                </div>
              ))}
            </ul>
          )}
        </div>
       )}
     </div>
   );
}
