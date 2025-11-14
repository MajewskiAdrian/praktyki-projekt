"use client";
import { useEffect, useState } from "react";

interface JoinEventButtonProps {
  eventId: number;
}

export default function JoinEventButton({ eventId }: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState("");

  const authHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    console.log("🔍 Checking join status for event:", eventId);
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/users/events/joined", {
          cache: "no-store",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
        });



        if (!res.ok) {
          console.log("❌ Response not OK");
          return;
        }

        let data: any = null;
        try {
          data = await res.json();
        } catch (e) {
          data = [];
        }

        const list = Array.isArray(data.joinedEvents) ? data.joinedEvents : [];

        const joinedIds = list.map((e: any) => String(e.id ?? e.eventId));

        const joined = joinedIds.includes(String(eventId));
        
        if (!cancelled) setIsJoined(joined);
      } catch (error) {
        
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const handleJoin = async () => {
    if (isJoined || loading) return;

    setLoading(true);
    setMessage("");

    console.log("🚀 Attempting to join event:", eventId);

    try {
      const res = await fetch("/api/events/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });

      console.log("📡 Join response status:", res.status);

      let body: any = {};
      try {
        body = await res.json();
        console.log("📦 Join response body:", body);
      } catch {
        console.log("⚠️ No JSON body in response");
      }

      if (res.status === 401) {
        setMessage("You must be logged in.");
      } else if (!res.ok) {
        setMessage(body?.error || "Failed to join");
      } else {
        console.log("✅ Successfully joined!");
        setIsJoined(true);
        setMessage("Joined");
      }
    } catch (error) {
      console.error("❌ Error joining event:", error);
      setMessage("Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleJoin}
        disabled={loading || isJoined}
        className={`px-4 py-2 rounded text-white transition-colors ${isJoined
            ? "bg-green-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
          }`}
      >
        {isJoined ? "Joined" : loading ? "Joining..." : "Join Event"}
      </button>
    </div>
  );
}

