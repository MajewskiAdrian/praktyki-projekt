"use client";
import "@/app/ui/global.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import CircleMenu from "@/app/components/CircleMenu";
import EventData from "@/app/components/EventData";
import EditEvent from "@/app/components/EditEventModal";
import { Event } from "@/app/components/EventsList";

// typ dla profilu użytkownika
interface UserProfile {
  id: string;
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
  creatorId: string;
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

type CombinedEvent = EventItem & { source: "created" | "joined" };

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<EventItem[] | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[] | null>(null);
  const [followedChannels, setFollowedChannels] = useState<Channel[] | null>(null);
  const [locationNames, setLocationNames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"all" | "created">("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setProfile(data.user);
      })
      .catch((err) => console.error("Failed to fetch profile:", err));
  }, []);

  const fetchCreatedEvents = () => {
    fetch("/api/users/events/created")
      .then((res) => res.json())
      .then((data) => {
        if (data.createdEvents) setCreatedEvents(data.createdEvents);
      })
      .catch((err) => console.error("Failed to fetch created events:", err));
  };

  const fetchJoinedEvents = () => {
    fetch("/api/users/events/joined")
      .then((res) => res.json())
      .then((data) => {
        if (data.joinedEvents) setJoinedEvents(data.joinedEvents);
      })
      .catch((err) => console.error("Failed to fetch joined events:", err));
  };

  useEffect(() => {
    fetchCreatedEvents();
  }, []);

  useEffect(() => {
    fetchJoinedEvents();
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

  // If an event is being edited, try to find its data from the already-loaded events
  const editingEvent = editingEventId ? combinedEvents.find((e) => e.id === editingEventId) : undefined;

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setActionLoading(eventId);
    setActionMessage(null);

    try {
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage({ type: 'success', text: data.message || "Event deleted successfully" });
        setCreatedEvents(prev => prev ? prev.filter(e => e.id !== eventId) : null);
        setJoinedEvents(prev => prev ? prev.filter(e => e.id !== eventId) : null);
        setOpenMenuId(null);
        
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage({ type: 'error', text: data.error || "Failed to delete event" });
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      setActionMessage({ type: 'error', text: "Error: " + (error as Error).message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to leave this event?')) return;

    setActionLoading(eventId);
    setActionMessage(null);

    try {
      const response = await fetch(`/api/events/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        setActionMessage({ type: 'success', text: "You have left the event" });
        setJoinedEvents(prev => prev ? prev.filter(e => e.id !== eventId) : null);
        setOpenMenuId(null);
        
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage({ type: 'error', text: data.error || "Failed to leave the event" });
      }
    } catch (error) {
      console.error('Failed to leave event:', error);
      setActionMessage({ type: 'error', text: "An error occurred. Please try again." });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEventUpdated = () => {
    setActionMessage({ type: 'success', text: "Event updated successfully" });
    setEditingEventId(null);
    setOpenMenuId(null);
    
    // Refresh events lists
    fetchCreatedEvents();
    fetchJoinedEvents();
    
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleEditClick = (eventId: string) => {
    setEditingEventId(eventId);
    setOpenMenuId(null);
  };

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

    return events.map((event) => {
      const isCreator = profile && event.creatorId === profile.id;
      const isMenuOpen = openMenuId === event.id;
      const isLoading = actionLoading === event.id;

      return (
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
                onClick={() => setSelectedEvent(event as any)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                title="Details"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setOpenMenuId(isMenuOpen ? null : event.id)}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  )}
                </button>

                {isMenuOpen && !isLoading && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-1 z-10">
                    {isCreator ? (
                      <>
                        <button
                          onClick={() => handleEditClick(event.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Event
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete Event
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleLeaveEvent(event.id)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Leave Event
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    });
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

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId && !(event.target as Element).closest('.relative')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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
        {/* Action Message */}
        {actionMessage && (
          <div className={`mb-4 p-4 rounded-lg ${
            actionMessage.type === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              <span>{actionMessage.text}</span>
            </div>
          </div>
        )}

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

      {/* Event Details Popup */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 h-fit-content flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-fadeIn">
            <EventData 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          </div>
        </div>
      )}

      {/* Edit Event Popup */}
      {editingEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setEditingEventId(null)}
          />
          
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Event</h2>
              <button
                onClick={() => setEditingEventId(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {editingEventId && (
                <EditEvent
                  eventId={editingEventId}
                  initialEvent={editingEvent ? {
                    id: editingEvent.id,
                    title: editingEvent.title,
                    description: editingEvent.description,
                    eventDate: new Date(editingEvent.eventDate).toISOString(),
                    maxAttendees: editingEvent.maxAttendees,
                    latitude: editingEvent.latitude,
                    longitude: editingEvent.longitude,
                    address: editingEvent.address ?? null,
                    city: editingEvent.city ?? null,
                    neighborhood: editingEvent.neighborhood ?? null,
                    tags: (editingEvent as any).tags ?? []
                  } : null}
                  onEventUpdated={handleEventUpdated}
                  onCancel={() => setEditingEventId(null)}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}