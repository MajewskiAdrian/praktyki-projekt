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

  const getInitials = (name?: string | null) =>
    (name || "?")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Normalizuj tagi na wszelki wypadek
  const normalizedTags = event.tags?.map(tag => {
    if (typeof tag === 'object' && tag !== null) {
      return (tag as any).name || String(tag);
    }
    return String(tag);
  }).filter(tag => tag.trim() !== '') || [];

  useEffect(() => {
    setIsLoading(true);

    const fetchEventData = async () => {
      try {
        

        // Pobierz attendees
        const attendeesRes = await fetch(`/api/events/${event.id}/attendees`, {
          cache: "no-store",
          credentials: "include",
        });

        if (!attendeesRes.ok) {
          throw new Error("Failed to fetch attendees");
        }

        const attendeesData = await attendeesRes.json();
        const attendeesList = attendeesData.attendees || [];

        console.log("📋 Attendees list:", attendeesList);
        setAttendees(attendeesList);

        // Set location after fetching other data
        const resolvedLocationName = [event.city, event.neighborhood, event.address]
          .filter((p) => p != null && String(p).trim() !== "")
          .map(String)
          .join(", ");

        setLocationName(
          resolvedLocationName || `${event.latitude}, ${event.longitude}`
        );

        // Sprawdź czy użytkownik jest w liście attendees
        const userRes = await fetch("/api/users/profile", {
          cache: "no-store",
          credentials: "include",
        });

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("👤 User data:", userData);

          const userId = userData.user?.id;
          console.log("🔍 User ID:", userId, typeof userId);

          if (!userId) {
            console.error("❌ User ID not found!");
            setIsUserJoined(false);
            setIsCreator(false);
            return;
          }

          // Sprawdź czy aktualny użytkownik to creator eventu
          const userIdStr = String(userId);
          const creatorIdStr = String(event.creator?.id || "");
          const amCreator = userIdStr === creatorIdStr;
          console.log("🔑 Is creator:", amCreator);
          setIsCreator(amCreator);

          // Sprawdź czy user jest w attendees
          const isJoined = attendeesList.some((attendee: any) => {
            const attendeeId = String(attendee.id);
            const userIdStr = String(userId);
            console.log(
              `Comparing: "${attendeeId}" === "${userIdStr}"`,
              attendeeId === userIdStr
            );
            return attendeeId === userIdStr;
          });

          console.log("✅ Is user joined:", isJoined);
          setIsUserJoined(isJoined);
        } else {
          console.error("❌ Failed to fetch user profile");
          setIsUserJoined(false);
          setIsCreator(false);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
        setAttendees([]);
        setIsUserJoined(false);
        setLocationName(`${event.latitude}, ${event.longitude}`);
      } finally {
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    fetchEventData();
  }, [event.id, event.latitude, event.longitude]);

  const handleJoinStatusChange = async (joined: boolean) => {
    console.log("🔄 Status changed to:", joined);
    setIsUserJoined(joined);

    // Odśwież listę attendees
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

  if (isLoading) {
    return <EventDataSkeleton onClose={onClose} />;
  }

  console.log("🎯 Rendering with isUserJoined:", isUserJoined);

  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-800 z-40 flex flex-col animate-fadeIn">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h3 className="text-2xl font-bold text-black dark:text-white">
          {event.title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white text-3xl font-bold leading-none ml-4"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4 h-full flex flex-col">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Description
            </h4>
            <p className="text-black dark:text-white text-base">
              {event.description}
            </p>
          </div>
          
          {/* Tags section - UŻYWAMY normalizedTags */}
          {normalizedTags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {normalizedTags.map((tag, index) => (
                  <div
                    key={`tag-${index}-${tag}`}
                    className="bg-amber-100 dark:bg-amber-700 text-amber-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author */}
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Author
            </h4>
            <div className="flex items-center gap-3">
              {event.creator?.avatarUrl ? (
                <img
                  src={event.creator.avatarUrl}
                  alt={event.creator?.name || "Author avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-semibold">
                  {getInitials(event.creator?.name)}
                </div>
              )}
              <div className="text-sm">
                <div className="text-black dark:text-white">
                  {event.creator?.name ?? "Unknown"}
                </div>
                {event.creator?.email && (
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {event.creator.email}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Location
            </h4>
            <p className="text-black dark:text-white text-sm">
              {locationName || "Loading location..."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Date & Time
            </h4>
            <p className="text-black dark:text-white text-sm">
              {new Date(event.eventDate).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div className="flex-1 min-h-0">
            <EventAttendees
              eventId={String(event.id)}
              initialAttendees={attendees}
              maxAttendees={event.maxAttendees}
            />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
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
      </div>
    </div>
  );
}
