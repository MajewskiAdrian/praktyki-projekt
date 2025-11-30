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
    <div className="flex flex-col h-full max-h-[90vh] min-h-0 rounded-b-2xl">
      {/* Header - Fixed */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

      {/* Scrollable Content */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-6 min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(209 213 219) transparent'
        }}
      >
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Description
            </h4>
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Tags */}
          {normalizedTags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {normalizedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-amber-500 text-white text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Author
            </h4>
            <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {displayCreator?.avatarUrl ? (
                <img
                  src={displayCreator.avatarUrl}
                  alt={displayCreator.name || "Creator"}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
                  {getInitials(displayCreator?.name)}
                </div>
              )}
              <span className="text-gray-800 dark:text-gray-200 font-medium">
                {displayCreator?.name || "Unknown"}
              </span>
            </div>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Location
            </h4>
            <p className="text-gray-800 dark:text-gray-200 break-words">
              {locationName || `${event.latitude}, ${event.longitude}`}
            </p>
          </div>

          {/* Google Maps Link */}
          {mapsUrl && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
                How to get there
              </h4>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 underline"
              >
                Open in Google Maps
              </a>
            </div>
          )}

          {/* Date & Time */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Date & Time
            </h4>
            <p className="text-gray-800 dark:text-gray-200">
              {new Date(event.eventDate).toLocaleString("pl-PL", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {/* Attendees - with LIMITED height and OWN scroll */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
              Attendees ({attendees.length}
              {event.maxAttendees ? `/${event.maxAttendees}` : ""})
            </h4>
            <div 
              className="space-y-2 overflow-y-auto pr-2"
              style={{
                maxHeight: '200px',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgb(209 213 219) transparent'
              }}
            >
              {attendees.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No attendees yet
                </p>
              ) : (
                attendees.map((attendee: any) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    {attendee.avatarUrl ? (
                      <img
                        src={attendee.avatarUrl}
                        alt={attendee.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(attendee.name)}
                      </div>
                    )}
                    <span className="text-gray-800 dark:text-gray-200 text-sm">
                      {attendee.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Button at Bottom */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
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
