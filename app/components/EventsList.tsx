"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";
import ListSort from "./ListSort";
import ListFilter from "./ListFilter";
import SearchBar from "./Searchbar";

export interface Event {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
  tags?: string[];
}

interface EventsListProps {
  onEventClick: (event: Event) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
}

export default function EventsList({ onEventClick, selectedEvent, setSelectedEvent }: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [searchText, setSearchText] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

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
      .then((data: any[]) => {
        // Konwersja danych - upewnij się, że tags jest tablicą stringów
        const normalizedEvents: Event[] = data.map((event) => ({
          ...event,
          tags: Array.isArray(event.tags)
            ? event.tags.map((tag: any) => {
                // Jeśli tag jest obiektem z właściwością 'name', użyj name
                if (typeof tag === 'object' && tag !== null) {
                  return tag.name || tag.id?.toString() || '';
                }
                // Jeśli tag jest stringiem, użyj go bezpośrednio
                return String(tag);
              }).filter((tag: string) => tag.trim() !== '')
            : []
        }));
        
        setEvents(normalizedEvents);

        // Wyciągnij wszystkie unikalne tagi
        const tags = new Set<string>();
        normalizedEvents.forEach((event) => {
          event.tags?.forEach((tag) => {
            if (tag && tag.trim()) {
              tags.add(tag.trim());
            }
          });
        });
        setAvailableTags(Array.from(tags).sort());
      })
      .catch((err: any) => {
        console.error("❌ Fetch error:", err);
        setError("Failed to load events.");
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...events];

    // Wyszukiwanie po tytule i opisie
    if (searchText) {
      result = result.filter(
        (event) =>
          event.title.toLowerCase().includes(searchText.toLowerCase()) ||
          event.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtrowanie po tagach
    if (selectedTags.length > 0) {
      result = result.filter((event) =>
        selectedTags.every((tag) => event.tags?.includes(tag))
      );
    }

    // Sortowanie
    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(result);
  }, [events, sortBy, searchText, selectedTags]);

  if (loading) return <p className="p-4">Loading events...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* KONTROLKI */}
      <div className={`p-4 space-y-2 border-b dark:border-gray-700 ${selectedEvent ? "blur-sm pointer-events-none" : ""}`}>
        <SearchBar searchText={searchText} setSearchText={setSearchText} />
        <ListFilter
          availableTags={availableTags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
        <ListSort sortBy={sortBy} setSortBy={setSortBy} />
      </div>

      {/* LISTA */}
      <ul
        className={`space-y-2 p-4 overflow-y-auto flex-1 transition-all ${
          selectedEvent ? "blur-sm pointer-events-none" : ""
        }`}
      >
        {filteredEvents.length === 0 && <p>No events to display.</p>}

        {filteredEvents.map((event) => (
          <li
            key={event.id}
            onClick={() => {
              setSelectedEvent(event);
              onEventClick(event);
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
               {new Date(event.eventDate).toLocaleString()}
            </p>
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={`${event.id}-${tag}-${index}`}
                    className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
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
