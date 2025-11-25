"use client";
import "@/app/ui/global.css";
import { useEffect, useState } from "react";
import DeleteEventButton from "@/app/components/DeleteEventButton";
import Link from "next/link";
import LeaveEventButton from "@/app/components/LeaveEventButton";
import CircleMenu from "@/app/components/CircleMenu";

// typ dla profilu użytkownika
interface UserProfile {
  name: string;
  email: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  maxAttendees: number;
  latitude: number;
  longitude: number;
  // optional address fields from DB
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  createdAt: string;
}

interface Channel {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  avatarUrl?: string; // Dodaj pole
}

// rozszerzony typ lokalny z informacją skąd event pochodzi
type CombinedEvent = EventItem & { source: "created" | "joined" };

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<EventItem[] | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[] | null>(null);
  const [followedChannels, setFollowedChannels] = useState<Channel[] | null>(null);
  const [locationNames, setLocationNames] = useState<Record<string, string>>(
    {}
  );

  // kontrolki do chowania/wyświetlania grup
  const [showCreated, setShowCreated] = useState(true);
  const [showJoined, setShowJoined] = useState(true);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  useEffect(() => {
    fetch("/api/users/events/created")
      .then((res) => res.json())
      .then((data) => {
        if (data.createdEvents) setCreatedEvents(data.createdEvents);
      })
      .catch((err) => console.error("Failed to fetch created events:", err));
  }, []);

  useEffect(() => {
    fetch("/api/users/events/joined")
      .then((res) => res.json())
      .then((data) => {
        if (data.joinedEvents) setJoinedEvents(data.joinedEvents);
      })
      .catch((err) => console.error("Failed to fetch joined events:", err));
  }, []);

  useEffect(() => {
    console.log("Fetching followed channels...");
    fetch("/api/users/channels/followed", {
      credentials: 'include', // Upewnij się że cookies są wysyłane
    })
      .then((res) => {
        console.log("Response status:", res.status);
        console.log("Response headers:", res.headers);
        return res.json();
      })
      .then((data) => {
        console.log("Response data:", data);
        if (data.followedChannels) {
          setFollowedChannels(data.followedChannels);
        } else if (data.error) {
          console.error("API Error:", data.error);
        }
      })
      .catch((err) => console.error("Failed to fetch followed channels:", err));
  }, []);

  const fetchLocations = (events: EventItem[]) => {
    events.forEach((event) => {
      if (locationNames[event.id]) return;

      // Build label from DB fields if present, otherwise fallback to coords
      const parts: string[] = [];
      if (event.address && event.address.trim()) parts.push(event.address.trim());
      if (event.neighborhood && event.neighborhood.trim()) parts.push(event.neighborhood.trim());
      if (event.city && event.city.trim()) parts.push(event.city.trim());

      const label = parts.length > 0 ? parts.join(", ") : `${event.latitude}, ${event.longitude}`;
      setLocationNames((prev) => ({ ...prev, [event.id]: label }));
    });
  };

  useEffect(() => {
    if (createdEvents) {
      fetchLocations(createdEvents);
    }
  }, [createdEvents]);

  useEffect(() => {
    if (joinedEvents) {
      fetchLocations(joinedEvents);
    }
  }, [joinedEvents]);

  const combinedEvents = (() => {
    const map = new Map<string, CombinedEvent>();

    if (createdEvents) {
      for (const e of createdEvents) {
        map.set(e.id, { ...e, source: "created" });
      }
    }

    if (joinedEvents) {
      for (const e of joinedEvents) {
        if (!map.has(e.id)) {
          map.set(e.id, { ...e, source: "joined" });
        }
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );
  })();

  const renderCombinedList = (events: CombinedEvent[]) => {
    if (events.length === 0) {
      return <p>Brak wydarzeń do wyświetlenia.</p>;
    }

    return events.map((event) => (
      <div
        key={event.id}
        className={`p-4 mb-2 rounded-md shadow-md overflow-auto flex justify-between items-start ${
          event.source === "created"
            ? "bg-white dark:bg-green-900/40 border-2 border-green-200/30"
            : "bg-white dark:bg-amber-900/40 border-2 border-amber-200/30"
        }`}
      >
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h2 className="font-semibold text-lg">{event.title}</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                event.source === "created"
                  ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-100"
                  : "bg-amber-200 text-amber-800 dark:bg-amber-700 dark:text-amber-100"
              }`}
            >
              {event.source === "created" ? "Created" : "Joined"}
            </span>
          </div>
          <p>{event.description}</p>
          <p>
            Date:{" "}
            {new Date(event.eventDate).toLocaleString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
  
          <p>
            Location:{" "}
            {locationNames[event.id] || `${event.latitude}, ${event.longitude}`}
          </p>
        </div>

        <div className="ml-4 flex flex-col items-end space-y-2">
          {event.source === "created" ? (
            <DeleteEventButton eventId={event.id} />
          ) : (
            <LeaveEventButton eventId={event.id} />
          )}
        </div>
        <div className="ml-4 flex flex-col items-end space-y-2">
          <button>Details</button>
        </div>
      </div>
    ));
  };

  const renderChannels = () => {
    if (followedChannels === null) {
      return <p>Loading channels...</p>;
    }

    if (followedChannels.length === 0) {
      return <p>Nie obserwujesz żadnych kanałów.</p>;
    }

    return followedChannels.map((channel) => (
      <Link
        key={channel.id}
        href={`/channels/${channel.id}`}
        className="block p-4 mb-2 rounded-md shadow-md bg-white dark:bg-purple-900/40 border-2 border-purple-200/30 hover:bg-purple-50 dark:hover:bg-purple-900/60 transition"
      >
        <div className="flex items-start space-x-3">
          {/* Avatar kanału */}
          <div className="flex-shrink-0">
            {channel.avatarUrl ? (
              <img
                src={channel.avatarUrl}
                alt={channel.title}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-500 dark:bg-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {channel.title.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Informacje o kanale */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{channel.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {channel.description}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Created: {new Date(channel.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Link>
    ));
  };

  return (
    <>
      <header className="bg-gray-300 dark:bg-gray-800 flex justify-between items-center px-6 py-4 mb-0 rounded-b-sm relative z-50">
        <div className="text-black dark:text-white font-semibold m-0">Venn</div>
        <CircleMenu />
      </header>
      <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-6 mt-0 overflow-hidden">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Welcome to the Dashboard
          {profile ? `, ${profile.name}` : ""}
        </h1>

        <div className="flex flex-1 mt-6 space-x-4 overflow-hidden">
          <div className="w-1/2 mt-6 flex flex-col flex-1 min-h-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-2.5 z-10 position-relative">
              Events:{" "}
            </h2>
            <div className="border-2 p-4 overflow-y-auto scrollbar-hide bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex-1 min-h-0">
              <div className="mb-4 flex items-center space-x-3">
                <button
                  onClick={() => setShowCreated((s) => !s)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    showCreated
                      ? "bg-green-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {showCreated ? "Hide created" : "Show created"}
                </button>
                <button
                  onClick={() => setShowJoined((s) => !s)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    showJoined
                      ? "bg-amber-600 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  }`}
                >
                  {showJoined ? "Hide joined" : "Show joined"}
                </button>
                <div className="text-sm text-gray-600 dark:text-gray-300 ml-auto">
                  Pokażono:{" "}
                  {combinedEvents.filter((e) => (e.source === "created" ? showCreated : showJoined)).length}
                </div>
              </div>

              {createdEvents === null || joinedEvents === null ? (
                <p>Loading events...</p>
              ) : (
                renderCombinedList(
                  combinedEvents.filter((e) => (e.source === "created" ? showCreated : showJoined))
                )
              )}
            </div>
          </div>
          <div className="w-1/2 mt-6 flex flex-col flex-1 min-h-0">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-2.5 z-10 position-relative">
              Followed Channels
            </h2>
            <div className="border-2 p-4 overflow-y-auto scrollbar-hide bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex-1 min-h-0">
              {renderChannels()}
            </div>
          </div>
        </div>
        <div className="fixed bottom-4 right-4">
          <Link
            href="/channels?from=/dashboard"
            className="rounded-full h-12 w-12 bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center transition-colors shadow-lg"
          >
            💬
          </Link>
        </div>
      </div>
    </>
  );
}
