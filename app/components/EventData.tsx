import { useEffect, useState } from "react";
import JoinEventButton from "./JoinEventButton";
import EventAttendees from "./EventAttendees";
import EventDataSkeleton from "./EventDataSkeleton";
import { Event } from "./EventsList";

interface EventDataProps {
  event: Event;
  onClose: () => void;
}

export default function EventData({ event, onClose }: EventDataProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [fullEventData, setFullEventData] = useState<any>(null);

  const getInitials = (name?: string | null) =>
    (name || "?")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const normalizedTags = event.tags?.map(tag => {
    if (typeof tag === 'object' && tag !== null) {
      return (tag as any).name || String(tag);
    }
    return String(tag);
  }).filter(tag => tag.trim() !== '') || [];

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true);
      try {
        const userRes = await fetch("/api/users/profile", {
          credentials: "include",
        });

        let userId: string | null = null;
        if (userRes.ok) {
          const userData = await userRes.json();
          userId = userData.user?.id;
        }

        if (event?.id != null) {
          const eventRes = await fetch(`/api/events`, {
            credentials: "include",
          });

          if (eventRes.ok) {
            const eventsData = await eventRes.json();
            const fullEvent = eventsData.find((e: any) => String(e.id) === String(event.id));
            if (fullEvent) {
              setFullEventData(fullEvent);

              if (userId && fullEvent.creatorId) {
                const isEventCreator = String(fullEvent.creatorId) === String(userId);
                setIsCreator(isEventCreator);
              }
            }
          }

          const attendeesRes = await fetch(
            `/api/events/${encodeURIComponent(String(event.id))}/attendees`,
            { credentials: "include" }
          );

          if (attendeesRes.ok) {
            const attendeesData = await attendeesRes.json();
            const attendeesList = attendeesData.attendees || [];
            setAttendees(attendeesList);

            if (userId) {
              const joined = attendeesList.some((a: any) => String(a.id) === String(userId));
              setIsUserJoined(joined);
            }
          }
        }

        // Use location data from the database (fullEventData) when available.
        // Do NOT call the reverse-geocode API at render/load time here.
        // Prefer explicit DB fields like `locationName` or `geocodedAddress` on the
        // full event record, then fall back to city/neighborhood/address or lat/lng.
        if (fullEventData) {
          const name =
            (fullEventData.locationName as string) ||
            (fullEventData.geocodedAddress as string) ||
            [fullEventData.city, fullEventData.neighborhood, fullEventData.address]
              .filter((p: any) => p != null && String(p).trim() !== "")
              .map(String)
              .join(", ");

          if (name && String(name).trim() !== "") {
            setLocationName(name);
          }
        } else {
          // Fallback to the incoming `event` props (these should be DB-derived too).
          const name =
            [event.city, event.neighborhood, event.address]
              .filter((p) => p != null && String(p).trim() !== "")
              .map(String)
              .join(", ") ||
            (event.latitude != null && event.longitude != null
              ? `${event.latitude}, ${event.longitude}`
              : null);

          if (name) setLocationName(name);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setAttendees([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [event.id]);

  const handleJoinStatusChange = async (joined: boolean) => {
    setIsUserJoined(joined);

    try {
      const attendeesRes = await fetch(`/api/events/${event.id}/attendees`, {
        cache: "no-store",
        credentials: "include",
      });

      if (attendeesRes.ok) {
        const attendeesData = await attendeesRes.json();
        setAttendees(attendeesData.attendees || []);
      }
    } catch (error) {
      console.error("Error refreshing attendees:", error);
    }
  };

  // Build a safe Google Maps URL when coordinates are available.
  const mapsUrl =
    event?.latitude != null && event?.longitude != null
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          `${event.latitude},${event.longitude}`
        )}`
      : null;

  if (isLoading) {
    return <EventDataSkeleton onClose={onClose} />;
  }

  const displayCreator = fullEventData?.creator || event.creator;

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h3 className="text-2xl font-bold text-black dark:text-white">
          {event.title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white text-3xl font-bold leading-none ml-4 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full w-10 h-10 flex items-center justify-center transition"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(209 213 219) transparent'
      }}>
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Description
            </h4>
            <p className="text-black dark:text-white text-base leading-relaxed">
              {event.description}
            </p>
          </div>

          {normalizedTags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {normalizedTags.map((tag, index) => (
                  <div
                    key={`tag-${index}-${tag}`}
                    className="bg-amber-100 dark:bg-amber-700 text-amber-800 dark:text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Author
            </h4>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {displayCreator?.avatarUrl ? (
                <img
                  src={displayCreator.avatarUrl.startsWith('/') ? displayCreator.avatarUrl : `/${displayCreator.avatarUrl}`}
                  alt={displayCreator?.name || "Author avatar"}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-sm font-semibold">
                  {getInitials(displayCreator?.name)}
                </div>
              )}
              <div className="text-sm">
                <div className="text-black dark:text-white text-base">
                  {displayCreator?.name ?? "Unknown"}
                </div>
                {/* {displayCreator?.email && (
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {displayCreator.email}
                  </div>
                )} */}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Location
            </h4>
            <p className="text-black dark:text-white text-base">
              {locationName || "Loading location..."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              How to get there
            </h4>
            <p className="text-black dark:text-white text-base">
              {mapsUrl ? (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:underline"
                >
                  Open in Google Maps
                </a>
              ) : (
                <span className="text-gray-500">Coordinates not available</span>
              )}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Date & Time
            </h4>
            <p className="text-black dark:text-white text-base">
              {new Date(event.eventDate).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3">
              Attendees ({attendees.length}{event.maxAttendees ? `/${event.maxAttendees}` : ''})
            </h4>
            <EventAttendees
              eventId={String(event.id)}
              initialAttendees={attendees}
              onAttendeesUpdate={setAttendees}
              maxAttendees={event.maxAttendees ?? undefined}
            />
          </div>
        </div>
      </div>

      {/* Fixed button at bottom */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
        <JoinEventButton
          eventId={event.id}
          initialIsJoined={isUserJoined}
          isCreator={isCreator}
          onStatusChange={handleJoinStatusChange}
          isFull={
            event.maxAttendees
              ? attendees.length >= event.maxAttendees
              : false
          }
        />
      </div>
    </div>
  );
}
