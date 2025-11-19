"use client";
import { useEffect, useState, useRef } from "react";

interface Attendee {
  id: string;
  name: string;
  email: string;
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

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">
        Attendees {maxAttendees ? `(${attendees.length}/${maxAttendees})` : `(${attendees.length})`}
      </h4>
      {attendees.length === 0 ? (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No attendees yet. Be the first to join!
        </p>
      ) : (
        <ul className="space-y-2">
          {attendees.map((attendee) => (
            <li
              key={attendee.id}
              className="text-sm text-black dark:text-white bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded"
            >
              <div className="font-medium">{attendee.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {attendee.email}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
