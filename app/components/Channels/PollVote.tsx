'use client';

import { useState } from 'react';

interface PollOption {
  id: string;
  text: string;
}

interface PollVote {
  optionId: string;
  user: { id: string };
}

interface PollVoteProps {
  messageId: string;
  channelId: string;
  question: string;
  options: PollOption[];
  votes: PollVote[];
  onVoteChange: (votes: PollVote[]) => void;
}

export default function PollVote({ 
  messageId, 
  channelId, 
  question, 
  options,
  votes,
  onVoteChange 
}: PollVoteProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const countVotes = (optionId: string) => {
    return votes.filter(v => v && v.optionId === optionId).length;
  };

  const voteInPoll = async (optionId: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      console.log('Voting for option:', optionId);
      
      const res = await fetch(
        `/api/channels/${channelId}/messages/${messageId}/vote`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ optionId })
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to vote');
      }

      const vote = await res.json();
      console.log('Vote response:', vote);

      if (!vote.user || !vote.user.id) {
        throw new Error('Invalid vote response from server');
      }

      // Usuń stary głos tego użytkownika i dodaj nowy
      const newVotes = votes.filter(v => v.user && v.user.id !== vote.user.id);
      const updatedVotes = [...newVotes, vote];
      
      onVoteChange(updatedVotes);
      setSelectedOption(optionId);

      // Opcjonalnie: odśwież po krótkiej chwili
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error: any) {
      console.error('Failed to vote:', error);
      alert(error.message || 'Failed to vote');
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = votes.length;

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📊</span>
        <p className="font-semibold text-gray-800">{question}</p>
      </div>
      
      <div className="space-y-2">
        {options.map((opt) => {
          if (!opt || !opt.id) return null;
          
          const voteCount = countVotes(opt.id);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(0) : 0;
          const isSelected = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => voteInPoll(opt.id)}
              disabled={loading}
              className={`w-full text-left p-3 border rounded-lg transition-all relative overflow-hidden ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:bg-gray-100'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Progress bar */}
              {totalVotes > 0 && (
                <div 
                  className="absolute inset-0 bg-blue-100 opacity-30 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              {/* Content */}
              <div className="relative flex justify-between items-center">
                <span className="font-medium">{opt.text}</span>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {totalVotes > 0 && (
                    <>
                      <span className="font-semibold">{percentage}%</span>
                      <span className="text-gray-400">·</span>
                    </>
                  )}
                  <span>{voteCount} {voteCount === 1 ? 'vote' : 'votes'}</span>
                </div>
              </div>
            </button>
          );
        })}
        
        {/* Total votes summary */}
        {totalVotes > 0 && (
          <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
            📊 Total votes: <span className="font-semibold">{totalVotes}</span>
          </p>
        )}
      </div>
    </div>
  );
}