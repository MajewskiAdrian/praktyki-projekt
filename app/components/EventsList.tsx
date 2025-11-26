"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";
import ListSort from "./ListSort";
import ListFilter from "./ListFilter";
import DateRangeFilter from "./DateRangeFilter";
import EventListSkeleton from "./EventListSkeleton";

export interface Event {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
  tags?: any[];
  location?: string;
  locationLoading?: boolean;
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
  filtersOnly?: boolean;
  useModal?: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  sortBy: "date" | "title";
  setSortBy: (sort: "date" | "title") => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export default function EventsList({ 
  onEventClick, 
  selectedEvent, 
  setSelectedEvent,
  filtersOnly = false,
  useModal = false,
  searchText,
  setSearchText,
  sortBy,
  setSortBy,
  selectedTags,
  setSelectedTags,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const normalizedEvents: Event[] = data.map((event) => {
          const tags = Array.isArray(event.tags)
            ? event.tags
                .map((tag: any) => {
                  if (typeof tag === "object" && tag !== null) {
                    return tag.name || tag.id?.toString() || "";
                  }
                  return String(tag);
                })
                .filter((tag: string) => tag.trim() !== "")
            : [];

          const location = event.city || event.neighborhood || event.address || undefined;

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
      const q = searchText.toLowerCase();
      result = result.filter((event) => {
        const inTitle = event.title && event.title.toLowerCase().includes(q);
        const inDesc = event.description && event.description.toLowerCase().includes(q);
        const inLocation = event.location && event.location.toLowerCase().includes(q);
        return Boolean(inTitle || inDesc || inLocation);
      });
    }

    if (startDate) {
      result = result.filter((event) => new Date(event.eventDate) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter((event) => new Date(event.eventDate) <= new Date(endDate + "T23:59:59"));
    }

    if (selectedTags.length > 0) {
      result = result.filter((event) => selectedTags.every((tag) => event.tags?.includes(tag)));
    }

    if (sortBy === "date") {
      result.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(result);
  }, [events, sortBy, searchText, selectedTags, startDate, endDate]);

  if (filtersOnly) {
    return (
      <>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Szukaj
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Użyj paska wyszukiwania powyżej — wyszukuje po tytule, opisie i lokalizacji.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sortuj według
            </label>
            <ListSort sortBy={sortBy} setSortBy={setSortBy} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Zakres dat
            </label>
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>

          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filtry tagów
              </label>
              <ListFilter
                availableTags={availableTags}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />
            </div>
          )}
        </div>
      </>
    );
  }

  if (loading) return <EventListSkeleton count={5} />;
  if (error) return <p className="p-4 text-red-500 text-sm">{error}</p>;

  return (
    <div className="relative h-full flex flex-col">
      {/* Modal - tylko gdy useModal jest true */}
      {useModal && selectedEvent && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90%] overflow-hidden animate-in zoom-in-95 duration-200">
            <EventData event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>
      )}

      {/* Event Data Block - zajmuje całą wysokość gdy useModal jest false i mamy selectedEvent */}
      {!useModal && selectedEvent ? (
        <div className="h-full bg-white dark:bg-gray-800 overflow-hidden">
          <EventData event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        </div>
      ) : (
        // Lista wydarzeń - pokazuje się tylko gdy nie ma wybranego eventu
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-3">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Nie znaleziono wydarzeń</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Spróbuj zmienić filtry wyszukiwania</p>
            </div>
          ) : (
            <ul className="p-4 space-y-3">
              {filteredEvents.map((event) => (
                <li
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    onEventClick(event);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-4 cursor-pointer border-2 border-gray-100 dark:border-gray-600 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{event.description}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate max-w-[120px]">
                          {event.locationLoading ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></span>
                              Ładowanie...
                            </span>
                          ) : event.location ? (
                            event.location
                          ) : (
                            "Brak lokalizacji"
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(event.eventDate).toLocaleString("pl-PL", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {event.tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={`${event.id}-${tag}-${index}`}
                            className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {event.tags.length > 4 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                            +{event.tags.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
