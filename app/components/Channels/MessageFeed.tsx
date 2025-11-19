'use client';

import { useEffect, useState } from 'react';
import MessageItem from './MessageItem';

interface Message {
  id: string;
  type: string;
  content: any;
  createdAt: string;
  author: { id: string; name: string };
  reactions: Array<{ emoji: string; user: { id: string } }>;
  pollVotes?: Array<{ optionId: string; user: { id: string } }>;
}

export default function MessageFeed({ channelId }: { channelId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMessages();
  }, [channelId]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/channels/${channelId}/messages`, {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }

      const data = await res.json();
      
      // Sprawdź czy data jest tablicą
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        console.error('API returned non-array:', data);
        setMessages([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch messages:', err);
      setError(err.message);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No messages yet</p>
        <p className="text-sm mt-2">Be the first to post something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} channelId={channelId} />
      ))}
    </div>
  );
}