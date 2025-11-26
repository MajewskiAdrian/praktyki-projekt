"use client";
import { useEffect, useState, useRef } from "react";

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}

interface EventAttendeesProps {
  eventId: string;
  initialAttendees?: Attendee[];
  onAttendeesUpdate?: (attendees: Attendee[]) => void;
  maxAttendees?: number;
}

export default function EventAttendees({ 
  eventId, 
  initialAttendees = [],
  onAttendeesUpdate,
  maxAttendees
}: EventAttendeesProps) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Użyj initialAttendees i NIE pobieraj danych ponownie
  useEffect(() => {
    setAttendees(initialAttendees);
  }, [initialAttendees]);

  if (loading) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Loading attendees...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        {error}
      </div>
    );
  }

  const getInitials = (name?: string | null) =>
    (name || "?")
      .trim()
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div>
      {attendees.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No attendees yet
        </div>
      ) : (
        <div className="space-y-2">
          {attendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center gap-3">
              {attendee.avatarUrl ? (
                <img
                  src={attendee.avatarUrl.startsWith('/') ? attendee.avatarUrl : `/${attendee.avatarUrl}`}
                  alt={attendee.name || "Attendee avatar"}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-semibold">
                  {getInitials(attendee.name)}
                </div>
              )}
              <div className="text-sm">
                <div className="text-black dark:text-white">{attendee.name}</div>
                {/* {attendee.email && (
                  <div className="text-gray-500 dark:text-gray-400 text-xs">
                    {attendee.email}
                  </div>
                )} */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
