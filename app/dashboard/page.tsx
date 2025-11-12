"use client";
import "@/app/ui/global.css";
import { useEffect, useState } from "react";
import DeleteEventButton from "@/app/components/DeleteEventButton";
import Link from "next/link";

// typ dla profilu użytkownika
interface UserProfile {
  name: string;
  email: string;
}

interface UserEvents {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  maxAttendees: number;
  latitude: number;
  longitude: number
  createdAt: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEvents, setUserEvents] = useState<UserEvents[] | null>(null);

  useEffect(() => {
    fetch("/api/users/profile")
      .then(res => res.json())
      .then(data => {
        if (data.user) setProfile(data.user);
      });

  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.userEvents) setUserEvents(data.userEvents);
      });
  }, []);

  const refreshEvents = async () => {
    const res = await fetch("/api/dashboard");
    const data = await res.json();
    if (data.userEvents) setUserEvents(data.userEvents);
  };


  const renderEvents = (events: UserEvents[]) => {
    return events.map(event => (
      <div key={event.id} className="p-4 bg-white dark:bg-gray-800 mb-2 rounded-md">
        <h2 className="font-semibold text-lg">{event.title}</h2>
        <p>{event.description}</p>
        <p>Date: {new Date(event.eventDate).toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}</p>
        <p>Max attendees: {event.maxAttendees}</p>
        <p>Location: {event.latitude}, {event.longitude}</p>
        <DeleteEventButton eventId={event.id} onDelete={refreshEvents} />

      </div>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col  bg-gray-100 dark:bg-gray-900 p-6">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
        Welcome to the Dashboard
        {profile ? `, ${profile.name}` : ''}
      </h1>

      <div className="w-1/2 mt-6 border p-4 ">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your events: </h2>
        {userEvents === null ? (
          <p>Loading events...</p>
        ) : userEvents.length === 0 ? (
          <p>You have no events.</p>
        ) : (
          renderEvents(userEvents)
        )}
      </div>
      <Link
        href="/"
        className="block mt-4 px-3 py-1.5 rounded-lg w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition text-center"
      >
        ← Return
      </Link>
    </div>
  );
}
