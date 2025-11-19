'use client';

import { useState, useEffect } from 'react';

interface FollowButtonProps {
  channelId: string;
  initialFollowing?: boolean;
}

export default function FollowButton({ channelId, initialFollowing = false }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${channelId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to follow/unfollow');
      }

      setIsFollowing(!isFollowing);
      
      // Refresh page to update member count
      window.location.reload();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded font-medium transition-colors ${
        isFollowing
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Loading...' : isFollowing ? '✓ Following' : '+ Follow'}
    </button>
  );
}