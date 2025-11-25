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
  avatarUrl?: string;
}

// rozszerzony typ lokalny z informacją skąd event pochodzi
type CombinedEvent = EventItem & { source: "created" | "joined" };

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<EventItem[] | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[] | null>(null);
  const [followedChannels, setFollowedChannels] = useState<Channel[] | null>(null);
  const [locationNames, setLocationNames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"all" | "created">("all");

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
    fetch("/api/users/channels/followed", {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
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

  const displayedEvents = activeTab === "all" 
    ? combinedEvents 
    : combinedEvents.filter(e => e.source === "created");

  const totalEvents = combinedEvents.length;

  const renderEventsList = (events: CombinedEvent[]) => {
    if (createdEvents === null || joinedEvents === null) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading events...
        </div>
      );
    }

    if (events.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No events to display.
        </div>
      );
    }

    return events.map((event) => (
      <div
        key={event.id}
        className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 truncate">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(event.eventDate).toLocaleDateString("pl-PL", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}, {new Date(event.eventDate).toLocaleTimeString("pl-PL", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="break-words">
                {locationNames[event.id] || `${event.latitude}, ${event.longitude}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title="Details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const renderChannels = () => {
    if (followedChannels === null) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Loading channels...
        </div>
      );
    }

    if (followedChannels.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          You're not following any channels yet.
        </div>
      );
    }

    return followedChannels.map((channel) => (
      <Link
        key={channel.id}
        href={`/channels/${channel.id}`}
        className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
      >
        <div className="flex-shrink-0">
          {channel.avatarUrl ? (
            <img
              src={channel.avatarUrl}
              alt={channel.title}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {channel.title.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white truncate">
            {channel.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Created {new Date(channel.createdAt).toLocaleDateString()}
          </p>
        </div>
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Venn</span>
          </div>
          <CircleMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to the Dashboard {profile ? profile.name : "user"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Zarządzaj swoimi wydarzeniami i kanałami
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Events Section - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events Header with Tab Switcher */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Events</h2>
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Event
                </Link>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {totalEvents} total events
              </p>

              {/* Tabs */}
              <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === "all"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  Joined Events
                </button>
                <button
                  onClick={() => setActiveTab("created")}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                    activeTab === "created"
                      ? "border-amber-500 text-amber-600 dark:text-amber-400"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  My Created
                </button>
              </div>
            </div>

            {/* Events List */}
            <div className="space-y-3">
              {renderEventsList(displayedEvents)}
            </div>
          </div>

          {/* Followed Channels Section - 1 column on large screens */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Followed Channels
                  </h2>
                  
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {followedChannels?.length || 0} channels
              </p>
              {/* Channels List */}
            <div className="space-y-2">
              {renderChannels()}
            </div>
            </div>

            

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalEvents}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Events</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 text-center">
                <div className="flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {followedChannels?.length || 0}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Channels</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Link
        href="/channels"
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        title="Browse Channels"
      >
        <span className="text-2xl">💬</span>
      </Link>
    </div>
  );
}
