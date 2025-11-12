"use client";
import { useState } from "react";

interface JoinEventButtonProps {
    eventId: number;
}

export default function JoinEventButton({ eventId }: JoinEventButtonProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    
    const handleJoin = async () => { // Add 'async' here
        setLoading(true);
        setMessage("");

        try {
            const response = await fetch('/api/events/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`, // Add token
                },
                body: JSON.stringify({ eventId }), // Change 'id' to 'eventId'
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Successfully joined the event!');
            } else {
                setMessage(data.error || 'Failed to join the event.');
            }
        } catch (error) {
            console.error('Error joining event:', error);
            setMessage('Error joining event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button 
                onClick={handleJoin}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {loading ? 'Joining...' : 'Join Event'}
            </button>
            {message && (
                <p className={`mt-2 text-sm ${message.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </p>
            )}
        </div>
    );
}

