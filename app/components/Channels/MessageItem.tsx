'use client';

import { useState, useEffect } from 'react';
import ReactionPicker from './ReactionPicker';
import ReactionButton from './ReactionButton';
import PollVote from './PollVote';

interface Message {
  id: string;
  type: string;
  content: any;
  createdAt: string;
  author: { id: string; name: string };
  reactions: Array<{ emoji: string; user: { id: string; name: string } }>;
  pollVotes?: Array<{ optionId: string; user: { id: string } }>;
}

export default function MessageItem({ 
  message, 
  channelId 
}: { 
  message: Message; 
  channelId: string;
}) {
  const [reactions, setReactions] = useState(message.reactions || []);
  const [pollVotes, setPollVotes] = useState(message.pollVotes || []);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch logged-in user ID
  useEffect(() => {
    fetch('/api/users/profile', { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.id) setCurrentUserId(data.id);
      })
      .catch(() => setCurrentUserId(null));
  }, []);

  const handleReactionAdded = (newReaction: any) => {
    setReactions([...reactions, newReaction]);
  };

  const handleReactionRemoved = (emoji: string) => {
    setReactions(reactions.filter(r => !(r.emoji === emoji && r.user.id === currentUserId)));
  };

  const handleVoteChange = (newVotes: any[]) => {
    setPollVotes(newVotes);
  };

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc: any, r: any) => {
    if (!r || !r.emoji) return acc;
    
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, users: [], userIds: [] };
    }
    acc[r.emoji].count++;
    acc[r.emoji].userIds.push(r.user.id);
    if (r.user && r.user.name) {
      acc[r.emoji].users.push(r.user.name);
    }
    return acc;
  }, {});

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {message.author?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <span className="font-semibold text-sm">{message.author?.name || 'Unknown'}</span>
          <span className="text-xs text-gray-500 ml-2">
            {new Date(message.createdAt).toLocaleString('pl-PL', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-3">
        {/* TEXT */}
        {message.type === 'TEXT' && (
          <p className="text-gray-800 whitespace-pre-wrap">{message.content?.text || ''}</p>
        )}

        {/* ANNOUNCEMENT */}
        {message.type === 'ANNOUNCEMENT' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">📢</span>
              <span className="font-semibold text-yellow-800">Announcement</span>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">{message.content?.text || ''}</p>
          </div>
        )}

        {/* IMAGE */}
        {message.type === 'IMAGE' && (
          <div>
            {message.content?.text && (
              <p className="text-gray-800 mb-2 whitespace-pre-wrap">{message.content.text}</p>
            )}
            {message.content?.imageUrl && (
              <img 
                src={message.content.imageUrl} 
                alt="Message image" 
                className="max-w-md rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => window.open(message.content.imageUrl, '_blank')}
              />
            )}
          </div>
        )}

        {/* POLL */}
        {message.type === 'POLL' && message.content?.question && (
          <PollVote
            messageId={message.id}
            channelId={channelId}
            question={message.content.question}
            options={message.content.options || []}
            votes={pollVotes}
            onVoteChange={handleVoteChange}
          />
        )}
      </div>

      {/* Reactions */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
        {Object.entries(groupedReactions).map(([emoji, data]: [string, any]) => {
          const isUserReaction = currentUserId && data.userIds.includes(currentUserId);
          
          return (
            <ReactionButton
              key={emoji}
              emoji={emoji}
              count={data.count}
              users={data.users}
              messageId={message.id}
              channelId={channelId}
              isUserReaction={!!isUserReaction}
              onRemove={handleReactionRemoved}
            />
          );
        })}
        
        {/* Reaction Picker */}
        <ReactionPicker
          messageId={message.id}
          channelId={channelId}
          onReactionAdded={handleReactionAdded}
        />
      </div>
    </div>
  );
}