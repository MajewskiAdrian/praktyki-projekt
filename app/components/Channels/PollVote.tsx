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

function PollIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M7 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={className} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-3-3.87M7 21v-2a4 4 0 013-3.87M12 7a4 4 0 100-8 4 4 0 000 8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-3-3.87" opacity="0" />
    </svg>
  );
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

      // Remove previous vote by this user and add the new one
      const newVotes = votes.filter(v => v.user && v.user.id !== vote.user.id);
      const updatedVotes = [...newVotes, vote];
      
      onVoteChange(updatedVotes);
      setSelectedOption(optionId);

      // Optional: refresh shortly after
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="text-amber-500 dark:text-amber-400">
          <PollIcon className="h-5 w-5" />
        </div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">{question}</p>
      </div>
      
      <div className="space-y-2">
        {options.map((opt) => {
          if (!opt || !opt.id) return null;
          
          const voteCount = countVotes(opt.id);
          const percentage = totalVotes > 0 ? (voteCount / totalVotes * 100).toFixed(0) : '0';
          const isSelected = selectedOption === opt.id;

          return (
            <button
              key={opt.id}
              onClick={() => voteInPoll(opt.id)}
              disabled={loading}
              className={`w-full text-left p-3 rounded-lg transition-all relative overflow-hidden ${
                isSelected 
                  ? 'border border-amber-500 bg-amber-50 dark:bg-amber-700/20 dark:border-amber-400' 
                  : 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''} text-gray-700 dark:text-gray-200`}
            >
              {/* Progress bar (z-0) */}
              {totalVotes > 0 && (
                <div 
                  className="absolute inset-0 bg-amber-100 dark:bg-amber-600/30 opacity-30 transition-all duration-300 z-0"
                  style={{ width: `${percentage}%` }}
                />
              )}
              
              {/* Content (z-10 so it's above the progress bar) */}
              <div className="relative flex justify-between items-center z-10">
                <span className="font-medium">{opt.text}</span>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  {totalVotes > 0 && (
                    <>
                      <span className="font-semibold text-amber-600 dark:text-amber-300">{percentage}%</span>
                      <span className="text-gray-300 dark:text-gray-500">·</span>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="inline-flex items-center gap-1 mr-1 text-amber-500 dark:text-amber-400"></span>
            Total votes: <span className="font-semibold ml-1 text-gray-800 dark:text-gray-100">{totalVotes}</span>
          </p>
        )}
      </div>
    </div>
  );
}