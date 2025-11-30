"use client";
import { useEffect, useState } from "react";
import EventData from "./EventData";
import ListSort from "./ListSort";
import ListFilter from "./ListFilter";
import DateRangeFilter from "./DateRangeFilter";
import EventListSkeleton from "./EventListSkeleton";

// Haversine formula to compute distance in kilometers between two lat/lng points
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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
  distanceKm?: number | null;
}

export type MembershipFilter = "all" | "joined" | "not_joined" | "mine";

interface EventsListProps {
  onEventClick: (event: Event) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  filtersOnly?: boolean;
  useModal?: boolean;
  searchText: string;
  setSearchText: (text: string) => void;
  sortBy: "date" | "title" | "distance";
  setSortBy: (sort: "date" | "title" | "distance") => void;
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
  membershipFilter: MembershipFilter;
  setMembershipFilter: (v: MembershipFilter) => void;
  // optional shared location state (if provided, will be used instead of internal state)
  userLocation?: { lat: number; lng: number } | null;
  setUserLocation?: (coords: { lat: number; lng: number } | null) => void;
  locationError?: string | null;
  setLocationError?: (err: string | null) => void;
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
  setEndDate,
  membershipFilter,
  setMembershipFilter,
  userLocation,
  setUserLocation,
  locationError,
  setLocationError,
}: EventsListProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localLocationError, setLocalLocationError] = useState<string | null>(null);
  const [localUserLocation, setLocalUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const MembershipFilterToggle = () => (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Participation:</span>
      <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
        {([
          { key: "all", label: "All" },
          { key: "joined", label: "Joined" },
          { key: "not_joined", label: "Not Joined" },
          { key: "mine", label: "Mine" },
        ] as { key: MembershipFilter; label: string }[]).map(({ key, label }) => {
          const active = membershipFilter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setMembershipFilter(key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                active
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const loadEvents = () => {
    setLoading(true);
    setError(null);
    fetch("/api/events")
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.text()) || "Server error");
        return res.json();
      })
      .then((data: any[]) => {
        const normalized: Event[] = data.map((event) => {
          const tags = Array.isArray(event.tags)
            ? event.tags
                .map((tag: any) =>
                  typeof tag === "object" && tag !== null
                    ? tag.name || tag.id?.toString() || ""
                    : String(tag)
                )
                .filter((t: string) => t.trim() !== "")
            : [];
          const location = event.city || event.neighborhood || event.address || undefined;
          return { ...event, tags, location, locationLoading: false };
        });
        setEvents(normalized);
        const tagSet = new Set<string>();
        normalized.forEach((e) => e.tags?.forEach((t: string) => t && tagSet.add(t)));
        setAvailableTags(Array.from(tagSet).sort());
      })
      .catch(() => {
        setError("Failed to load events.");
        setEvents([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    fetch("/api/users/events/joined", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const ids = Array.isArray(d?.joinedEvents) ? d.joinedEvents.map((e: any) => String(e.id)) : [];
        setJoinedIds(new Set(ids));
      })
      .catch(() => setJoinedIds(new Set()));
  }, []);

  useEffect(() => {
    fetch("/api/users/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setCurrentUserId(d?.user?.id ? String(d.user.id) : null))
      .catch(() => setCurrentUserId(null));
  }, []);

  useEffect(() => {
    let result = [...events];

    if (searchText) {
      const q = searchText.toLowerCase();
      result = result.filter((e) =>
        [e.title, e.description, e.location]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(q))
      );
    }
    if (startDate) {
      result = result.filter((e) => new Date(e.eventDate) >= new Date(startDate));
    }
    if (endDate) {
      result = result.filter(
        (e) => new Date(e.eventDate) <= new Date(endDate + "T23:59:59")
      );
    }
    if (selectedTags.length > 0) {
      result = result.filter((e) => selectedTags.every((t) => e.tags?.includes(t)));
    }

    result = result.filter((e) => {
      const isCreator =
        currentUserId && e.creator?.id && String(e.creator.id) === String(currentUserId);
      const isJoined = joinedIds.has(String(e.id)) || isCreator;
      switch (membershipFilter) {
        case "joined":
          return isJoined;
        case "not_joined":
          return !isJoined;
        case "mine":
          return !!isCreator;
        default:
          return true;
      }
    });

    if (sortBy === "date") {
      result.sort(
        (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
      );
    } else if (sortBy === "distance") {
      const effectiveLoc = userLocation ?? localUserLocation;
      const setErr = setLocationError ?? setLocalLocationError;
      // If distance sort requested but no user location, keep as-is and show a hint
      if (!effectiveLoc) {
        setErr("Location not available. Please allow location access via the 'Use my location' button.");
      } else {
        setErr(null);
        // compute distances and sort
        result = result
          .map((e) => ({ ...e, distanceKm: haversine(e.latitude, e.longitude, effectiveLoc.lat, effectiveLoc.lng) }))
          .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0));
      }
    } else {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredEvents(result);
  }, [
    events,
    searchText,
    startDate,
    endDate,
    selectedTags,
    sortBy,
    userLocation,
    localUserLocation,
    membershipFilter,
    currentUserId,
    joinedIds
  ]);

  if (filtersOnly) {
    return (
      <div className="space-y-4">
        <div>
          <ListSort sortBy={sortBy} setSortBy={setSortBy} onUseLocation={(coords, err) => {
            const applyErr = (msg: string | null) => {
              if (setLocationError) return setLocationError(msg);
              return setLocalLocationError(msg);
            };
            const applyUserLoc = (c: { lat: number; lng: number } | null) => {
              if (setUserLocation) return setUserLocation(c);
              return setLocalUserLocation(c);
            };
            if (err) {
              applyErr(err);
              return;
            }
            if (coords) {
              applyUserLoc(coords);
              applyErr(null);
            }
          }} />
        </div>

        <div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />
        </div>

        <MembershipFilterToggle />

        {availableTags.length > 0 && (
          <div>
            <ListFilter
              availableTags={availableTags}
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
            />
          </div>
        )}
      </div>
    );
  }

  if (loading) return <EventListSkeleton count={5} />;
  if (error) return <p className="p-4 text-red-500 text-sm">{error}</p>;

  return (
    <div className="relative h-full flex flex-col">
      {/* Modal for event details */}
      {useModal && selectedEvent && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <EventData event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
            {(locationError ?? localLocationError) && (
              <div className="p-3 m-3 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{locationError ?? localLocationError}</div>
            )}
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No results for selected filters
          </div>
        ) : (
          <ul className="p-4 space-y-3">
            {filteredEvents.map((e) => {
              const isCreator =
                currentUserId && e.creator?.id && String(e.creator.id) === String(currentUserId);
              const isJoined = joinedIds.has(String(e.id)) || isCreator;
              return (
                <li
                  key={e.id}
                  onClick={() => {
                    setSelectedEvent(e);
                    onEventClick(e);
                  }}
                  className="bg-white dark:bg-gray-700 rounded-xl p-4 cursor-pointer border-2 border-gray-100 dark:border-gray-600 hover:border-amber-500 hover:shadow transition group"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                      {e.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCreator
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                          : isJoined
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isCreator
                            ? "bg-blue-500"
                            : isJoined
                            ? "bg-green-500"
                            : "bg-gray-400 dark:bg-gray-500"
                        }`}
                      />
                      {isCreator ? "Mine" : isJoined ? "Joined" : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {e.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {new Date(e.eventDate).toLocaleString("pl-PL", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>

                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        {e.location || "No location"}
                        {typeof e.distanceKm === "number" && (
                          <span className="ml-2 text-amber-600">· {e.distanceKm.toFixed(1)} km</span>
                        )}
                      </span>
                    </span>
                  </div>
                  {e.tags && e.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {e.tags.slice(0, 4).map((t, i) => (
                        <span
                          key={`${e.id}-${t}-${i}`}
                          className="px-2.5 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                      {e.tags.length > 4 && (
                        <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                          +{e.tags.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
