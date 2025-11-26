"use client";
import { useEffect, useState } from "react";
import EventTags from "./EventTags";

interface EditEventProps {
  eventId?: string;
  onEventUpdated?: () => void;
  onCancel?: () => void;
  // If provided, the modal will use this data instead of fetching from the API
  initialEvent?: Partial<EventData> | null;
}

interface EventData {
  id: number | string;
  title: string;
  description: string;
  eventDate: string;
  maxAttendees: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  tags: { id: number }[];
}

export default function EditEvent({ eventId, onEventUpdated, onCancel, initialEvent = null }: EditEventProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchLoading, setFetchLoading] = useState(true);

  // Location data
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [address, setAddress] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [neighborhood, setNeighborhood] = useState<string | null>(null);

  // Use provided initialEvent if available; otherwise fetch
  useEffect(() => {
    if (initialEvent) {
      try {
        setTitle(initialEvent.title || "");
        setDescription(initialEvent.description || "");
        setEventDate(initialEvent.eventDate ? new Date(initialEvent.eventDate).toISOString().slice(0, 16) : "");
        setMaxAttendees(initialEvent.maxAttendees ? String(initialEvent.maxAttendees) : "");
        setSelectedTags((initialEvent.tags || []).map((t: any) => (t && (t as any).id ? (t as any).id : Number(t))))
        setLatitude(initialEvent.latitude ?? 0);
        setLongitude(initialEvent.longitude ?? 0);
        setAddress(initialEvent.address ?? null);
        setCity(initialEvent.city ?? null);
        setNeighborhood(initialEvent.neighborhood ?? null);
      } catch (err: any) {
        console.error("Error applying initialEvent:", err);
        setError(String(err?.message || err));
      } finally {
        setFetchLoading(false);
      }
      return;
    }

    const fetchEvent = async () => {
      if (!eventId) {
        setError("No event id provided");
        setFetchLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data: EventData = await response.json();
        
        setTitle(data.title);
        setDescription(data.description);
        setEventDate(new Date(data.eventDate).toISOString().slice(0, 16));
        setMaxAttendees(data.maxAttendees ? String(data.maxAttendees) : "");
        setSelectedTags(data.tags.map(tag => tag.id));
        setLatitude(data.latitude);
        setLongitude(data.longitude);
        setAddress(data.address);
        setCity(data.city);
        setNeighborhood(data.neighborhood);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || String(err));
      } finally {
        setFetchLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, initialEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Walidacja daty
    const selectedDate = new Date(eventDate);
    const now = new Date();

    if (selectedDate < now) {
      setError("Event date cannot be in the past");
      return;
    }

    if (!title.trim() || !description.trim() || !eventDate) {
      setError("Please fill in all required fields");
      return;
    }

    setError("");
    setLoading(true);

    try {
      // Do NOT send address/city/neighborhood — these are computed server-side
      // by the reverse-geocode API. We only send lat/lng (and other editable fields).
      const payload = {
        title: title.trim(),
        description: description.trim(),
        latitude,
        longitude,
        eventDate,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        tagIds: selectedTags,
      };

      console.log("📤 Updating event:", payload);

      // Ensure we have a valid id to call the API with. Coerce to string for the URL.
      const rawId = eventId ?? initialEvent?.id;
      if (rawId === undefined || rawId === null) {
        throw new Error("No event id available for update");
      }
      const idToUse = String(rawId);
      console.log("Using event id for update:", idToUse);

      const response = await fetch(`/api/events/${idToUse}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        // include id and ensure tag ids are numeric on the wire so server has multiple ways
        // to identify the event (route param + body.id). This avoids "Invalid event id" errors
        // if one of them is malformed.
        body: JSON.stringify({ id: Number(idToUse), ...payload, tagIds: Array.isArray(selectedTags) ? selectedTags.map(Number) : [] }),
      });

      if (!response.ok) {
        const body = await response.text();
        let errorMessage = "Failed to update event";
        try {
          const json = JSON.parse(body);
          errorMessage = json.error || errorMessage;
        } catch {
          errorMessage = body || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("✅ Event updated:", data);

      if (onEventUpdated) onEventUpdated();
    } catch (err: any) {
      console.error("❌ Error updating event:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

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
          min={new Date().toISOString().slice(0, 16)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
          required
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location (do zrobienia)
        </label>
        {/* <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm text-gray-700 dark:text-gray-300">
          {/* Show current address if available, otherwise lat/lng. This is informational only;
              actual address/city/neighborhood is computed server-side on save via reverse-geocode. */}{/*
          {address ? address : `${latitude}, ${longitude}`}
        </div> */}
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-4 rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Event"}
        </button>
      </div>
    </form>
  );
}