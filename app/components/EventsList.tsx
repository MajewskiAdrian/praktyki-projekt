"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";
import ListSort from "./ListSort";
import ListFilter from "./ListFilter";
import SearchBar from "./Searchbar";
import DateRangeFilter from "./DateRangeFilter";

export interface Event {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
  tags?: any[]; // normalized to string[] later
  location?: string;
  locationLoading?: boolean;
  // optional additional fields from API
  creator?: { id: string; name?: string; email?: string; avatarUrl?: string } | null;
  maxAttendees?: number | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
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
  const [searchType, setSearchType] = useState<"text" | "location">("text");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
        const normalizedEvents: Event[] = data.map((event) => {
          const tags = Array.isArray(event.tags)
            ? event.tags.map((tag: any) => {
                if (typeof tag === 'object' && tag !== null) {
                  return tag.name || tag.id?.toString() || '';
                }
                return String(tag);
              }).filter((tag: string) => tag.trim() !== '')
            : [];

          // take location from DB fields (city, neighborhood, address) instead of reverse-geocoding
          const location =
            event.city || event.neighborhood || event.address || undefined;

          return {
            ...event,
            tags,
            location,
            locationLoading: false,
          };
        });

        setEvents(normalizedEvents);
        setLoading(false);

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
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let result = [...events];

    if (searchText) {
      if (searchType === "location") {
        result = result.filter((event) =>
          event.location && event.location.toLowerCase().includes(searchText.toLowerCase())
        );
      } else {
        result = result.filter(
          (event) =>
            event.title.toLowerCase().includes(searchText.toLowerCase()) ||
            event.description.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    }

    if (startDate) {
      result = result.filter(
        (event) => new Date(event.eventDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      result = result.filter(
        (event) => new Date(event.eventDate) <= new Date(endDate + "T23:59:59")
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((event) =>
        selectedTags.every((tag) => event.tags?.includes(tag))
      );
    }

    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(result);
  }, [events, sortBy, searchText, searchType, selectedTags, startDate, endDate]);

  if (loading) return <p className="p-4">Loading events...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* KONTROLKI */}
      <div className={`p-4 space-y-2 border-b dark:border-gray-700 ${selectedEvent ? "blur-sm pointer-events-none" : ""}`}>
        <SearchBar 
          searchText={searchText} 
          setSearchText={setSearchText}
          searchType={searchType}
          setSearchType={setSearchType}
        />
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />
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
            className={`bg-white dark:bg-gray-700 p-4 rounded shadow transition-all
              ${event.locationLoading 
                ? 'opacity-50 cursor-wait' 
                : 'hover:shadow-lg cursor-pointer hover:scale-[1.02]'
              }`}
          >
            <h3 className="font-bold text-lg text-black dark:text-white">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {event.locationLoading ? (
                <span className="inline-flex items-center gap-1">
                  <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                  Loading location...
                </span>
              ) : event.location ? (
                ` ${event.location}`
              ) : (
                ' Location unavailable'
              )}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {new Date(event.eventDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
            </p>
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={`${event.id}-${tag}-${index}`}
                    className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 rounded"
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
