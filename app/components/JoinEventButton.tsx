"use client";
import { useState, useEffect } from "react";

interface JoinEventButtonProps {
  eventId: number;
  initialIsJoined?: boolean;
  onStatusChange?: (joined: boolean) => void;
}

export default function JoinEventButton({ 
  eventId, 
  initialIsJoined = false,
  onStatusChange 
}: JoinEventButtonProps) {
  const [isJoined, setIsJoined] = useState(initialIsJoined);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("🔵 JoinEventButton useEffect - initialIsJoined:", initialIsJoined);
    setIsJoined(initialIsJoined);
  }, [initialIsJoined]);

  const handleJoinLeave = async () => {
    setIsLoading(true);
    try {
      const endpoint = isJoined ? "/api/events/leave" : "/api/events/join";
      console.log("📤 Calling:", endpoint, "for event:", eventId);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
        credentials: "include",
      });

      if (response.ok) {
        const newStatus = !isJoined;
        console.log("✅ Success! New status:", newStatus);
        setIsJoined(newStatus);
        onStatusChange?.(newStatus);
      } else {
        console.error("❌ Failed to update status:", await response.text());
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  console.log("🎨 Rendering button - isJoined:", isJoined);

  return (
    <button
      onClick={handleJoinLeave}
      disabled={isLoading}
      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
        isJoined
          ? "bg-red-500 hover:bg-red-600 text-white"
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
    >
      {isLoading ? "Processing..." : isJoined ? "Leave Event" : "Join Event"}
    </button>
  );
}

