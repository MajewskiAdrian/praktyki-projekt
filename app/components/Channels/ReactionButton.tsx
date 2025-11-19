'use client';

import { useState } from 'react';

interface ReactionButtonProps {
  emoji: string;
  count: number;
  users: string[];
  messageId: string;
  channelId: string;
  isUserReaction: boolean;
  onRemove: (emoji: string) => void;
}

export default function ReactionButton({
  emoji,
  count,
  users,
  messageId,
  channelId,
  isUserReaction,
  onRemove
}: ReactionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isUserReaction || loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `/api/channels/${channelId}/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (res.ok) {
        onRemove(emoji);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to remove reaction');
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      alert('Failed to remove reaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-all ${
        isUserReaction
          ? 'bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isUserReaction ? `${users.join(', ')} (Click to remove)` : users.join(', ')}
    >
      <span>{emoji}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
}