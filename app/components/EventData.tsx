import { useEffect, useState } from "react";
import JoinEventButton from "./JoinEventButton";
import EventAttendees from "./EventAttendees";
import EventDataSkeleton from "./EventDataSkeleton";

export default function EventData({
  event,
  onClose,
}: {
  event: any;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isUserJoined, setIsUserJoined] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);

    const fetchEventData = async () => {
      try {
        // Fetch location name in parallel
        const locationPromise = fetch(
          `/api/reverse-geocode?lat=${event.latitude}&lng=${event.longitude}`
        )
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => data?.label || null);

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
        const resolvedLocationName = await locationPromise;
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
            return;
          }

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
    <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col animate-fadeIn">
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
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {event.tags?.map((tag: { id: number; name: string }) => (
                <div
                  key={tag.id}
                  className="bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-white px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag.name}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Location
            </h4>
            <p className="text-black dark:text-white text-sm">
              📍 {locationName || "Loading location..."}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Date & Time
            </h4>
            <p className="text-black dark:text-white text-sm">
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
          <div className="flex-1 min-h-0">
            <EventAttendees
              eventId={String(event.id)}
              initialAttendees={attendees}
            />
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <JoinEventButton
              eventId={event.id}
              initialIsJoined={isUserJoined}
              onStatusChange={handleJoinStatusChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
