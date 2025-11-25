'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ChannelCard from './ChannelCard';

interface Channel {
  id: string;
  title: string;
  description: string | null;
  avatarUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    members: number;
    messages: number;
  };
}

export default function ChannelList() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/channels', {
        credentials: 'include'
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch channels (${res.status})`);
      }

      const data = await res.json();
      
      if (Array.isArray(data)) {
        setChannels(data);
      } else {
        console.error('API returned non-array:', data);
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      setError(error.message);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
        <p className="text-gray-500 mt-4">Loading channels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Error loading channels</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchChannels}
          className="mt-3 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div>
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          ← Back to Dashboard
        </button>
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl mb-2">No channels yet</p>
          <p>Be the first to create one!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleBack}
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        ← Back to Dashboard
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((channel) => (
          <ChannelCard key={channel.id} channel={channel} />
        ))}
      </div>
    </div>
  );
}