"use client";
import { useEffect, useState } from "react";
import EventTags from "./EventTags";
import { MyEvent } from "../types";

export default function AddEventForm({
  lat,
  lng,
  onEventAdded,
}: {
  lat: number;
  lng: number;
  onEventAdded?: (newEvent: MyEvent) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // hidden address states (prefilled from reverse-geocode)
  const [address, setAddress] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    const ac = new AbortController();

    (async () => {
      try {
        const params = new URLSearchParams({
          lat: String(lat),
          lng: String(lng),
        });
        const res = await fetch(`/api/reverse-geocode?${params.toString()}`, {
          signal: ac.signal,
        });
        if (!res.ok) return;
        const json = await res.json();
        setAddress(json.label || null);
        setCity(json.city || null);
        setNeighborhood(json.suburb || null);
      } catch {
        // ignore errors (keep nulls)
      }
    })();

    return () => ac.abort();
  }, [lat, lng]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        description,
        latitude: lat,
        longitude: lng,
        eventDate,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : undefined,
        tagIds: selectedTags,
        address,
        city,
        neighborhood,
      };

      console.log("📤 Sending data:", payload);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.text();
        let errorMessage = "Failed to create event";
        try {
          const json = JSON.parse(body);
          errorMessage = json.error || errorMessage;
        } catch {
          errorMessage = body || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Event created:", data);

      setTitle("");
      setDescription("");
      setEventDate("");
      setMaxAttendees("");
      setSelectedTags([]);
      setAddress(null);
      setCity(null);
      setNeighborhood(null);

      if (onEventAdded) onEventAdded(data);
    } catch (err: any) {
      console.error("❌ Error creating event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date and Time
        </label>
        <input
          type="datetime-local"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Max Attendees (optional)
        </label>
        <input
          type="number"
          value={maxAttendees}
          onChange={(e) => setMaxAttendees(e.target.value)}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <EventTags selectedTags={selectedTags} onChange={setSelectedTags} />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create an event"}
      </button>
    </form>
  );
}
