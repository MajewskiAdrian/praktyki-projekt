'use client';

import { useState, useRef, useEffect } from 'react';

interface ReactionPickerProps {
  messageId: string;
  channelId: string;
  onReactionAdded: (reaction: any) => void;
}

const EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀', '✨', '💯'];

export default function ReactionPicker({ 
  messageId, 
  channelId, 
  onReactionAdded 
}: ReactionPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const addReaction = async (emoji: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(
        `/api/channels/${channelId}/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ emoji })
        }
      );

      if (res.ok) {
        const newReaction = await res.json();
        onReactionAdded(newReaction);
        setIsOpen(false);
      } else {
        const error = await res.json();
        if (error.error !== 'Already reacted') {
          alert(error.error || 'Failed to add reaction');
        }
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
      alert('Failed to add reaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button 
        className="text-gray-400 hover:text-gray-600 px-2 py-1 text-sm transition-colors"
        disabled={loading}
        onClick={() => setIsOpen(!isOpen)}
      >
        {loading ? '...' : '+ React'}
      </button>
      
      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-xl p-2 z-50"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex gap-1">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                disabled={loading}
                className="hover:bg-gray-100 active:bg-gray-200 p-2 rounded text-xl transition-all hover:scale-125 disabled:opacity-50 disabled:cursor-not-allowed"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}