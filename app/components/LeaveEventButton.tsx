"use client";
import { useState } from "react";

interface LeaveEventButtonProps {
    eventId: string;
}

export default function LeaveEventButton({ eventId }: LeaveEventButtonProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isJoined, setIsJoined] = useState(true); // This should ideally come from props or context

    const handleLeaveEvent = async () => {
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(`/api/events/leave`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token") || ""}`,
                },
                body: JSON.stringify({ eventId }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("You have left the event.");
                setIsJoined(false);
            } else {
                setMessage(data.error || "Failed to leave the event.");
            } 
        } catch (error) {
            console.error("Error leaving event:", error);
            setMessage("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button
                onClick={handleLeaveEvent}
                disabled={loading || !isJoined}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
                {loading ? "Leaving..." : "Leave Event"}
            </button>
            {message && (
                <p className={`mt-2 text-sm ${message.includes('left') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}