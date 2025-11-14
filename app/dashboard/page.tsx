"use client";
import "@/app/ui/global.css";
import { useEffect, useState } from "react";
import DeleteEventButton from "@/app/components/DeleteEventButton";
import Link from "next/link";
import LeaveEventButton from "@/app/components/LeaveEventButton";

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
  createdAt: string;
}



export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdEvents, setCreatedEvents] = useState<EventItem[] | null>(null);
  const [joinedEvents, setJoinedEvents] = useState<EventItem[] | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then(res => res.json())
      .then(data => {
        if (data.user) setProfile(data.user);
      });

  }, []);

  useEffect(() => {
    fetch("/api/users/events/created")
      .then(res => res.json())
      .then(data => {
        if (data.createdEvents) setCreatedEvents(data.createdEvents);
      });
  }, []);

  useEffect(() => {
    fetch("/api/users/events/joined")
      .then(res => res.json())
      .then(data => {
        if (data.joinedEvents) setJoinedEvents(data.joinedEvents);
      });
  }, []);


  const renderEvents = (events: EventItem[], eventType: string) => {
    return events.map((event) => (
      <div
        key={event.id}
        className="p-4 bg-white dark:bg-gray-800 mb-2 rounded-md shadow-md overflow-auto"
      >
        <h2 className="font-semibold text-lg">{event.title}</h2>
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
        <p>Max attendees: {event.maxAttendees}</p>
        <p>
          Location: {event.latitude}, {event.longitude}
        </p>
          {eventType === 'created' ? (<DeleteEventButton eventId={event.id} />) : <LeaveEventButton eventId={event.id} />}
      </div>
    ));
  };
  ;

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 p-6 overflow-hidden">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        Welcome to the Dashboard
        {profile ? `, ${profile.name}` : ''}
      </h1>
      <Link
        href="/"
        className="block mt-4 px-3 py-1.5 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
      >
        ← Return
      </Link>

      <div className="flex flex-1 mt-6 space-x-4 overflow-hidden">
        <div className="w-1/2 mt-6 flex flex-col flex-1 min-h-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-2.5 z-10 position-relative">Events created by you: </h2>
          <div className="border-2 p-4 overflow-y-auto scrollbar-hide bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex-1 min-h-0">

            {createdEvents === null ? (
              <p>Loading events...</p>
            ) : createdEvents.length === 0 ? (
              <p>You have no events.</p>
            ) : (
              renderEvents(createdEvents, 'created')
            )}
          </div>
        </div>
        <div className="w-1/2 mt-6 flex flex-col flex-1 min-h-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-2.5 z-10 position-relative">Events you have joined: </h2>
          <div className="border-2 p-4 overflow-y-auto scrollbar-hide bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex-1 min-h-0">

            {joinedEvents === null ? (
              <p>Loading events...</p>
            ) : joinedEvents.length === 0 ? (
              <p>You have no events.</p>
            ) : (
              renderEvents(joinedEvents, 'joined')
            )}
          </div>
        </div>
      </div>

    </div>

  );
}
