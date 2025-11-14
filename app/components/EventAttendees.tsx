"use client";
import { useEffect, useState, useRef } from "react";

interface Attendee {
  id: string;
  name: string;
  email: string;
}

interface EventAttendeesProps {
  eventId: string;
}

export default function EventAttendees({ eventId }: EventAttendeesProps) {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    console.log("🔍 Fetching attendees for event:", eventId);

    // Anuluj poprzedni request jeśli istnieje
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const fetchAttendees = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/events/${eventId}/attendees`, {
          cache: "no-store",
          credentials: "include",
          signal: abortController.signal, // Dodaj signal do anulowania
        });

        console.log("📡 Attendees response status:", res.status);

        if (!res.ok) {
          const errorText = await res.text();
          console.error("❌ Error response:", errorText);
          throw new Error(`Failed to fetch attendees: ${res.status}`);
        }

        const data = await res.json();
        console.log("📦 Attendees data:", data);

        // Sprawdź czy request nie został anulowany
        if (!abortController.signal.aborted) {
          setAttendees(Array.isArray(data.attendees) ? data.attendees : []);
        }
      } catch (err: any) {
        // Ignoruj błąd abort - to normalne podczas czyszczenia
        if (err.name === 'AbortError') {
          console.log("⚠️ Request was cancelled");
          return;
        }
        
        console.error("❌ Error fetching attendees:", err);
        if (!abortController.signal.aborted) {
          setError("Failed to load attendees");
          setAttendees([]);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchAttendees();

    // Cleanup function - anuluj request przy unmount
    return () => {
      abortController.abort();
    };
  }, [eventId]); // Tylko eventId w dependencies

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
        Attendees ({attendees.length})
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
