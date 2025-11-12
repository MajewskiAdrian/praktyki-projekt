"use client";

import { useState } from "react";

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/events/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: eventId }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ " + data.message);
        // Optionally refresh or redirect
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (error) {
      setMessage("❌ Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {loading ? "Deleting..." : "Delete Event"}
      </button>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}