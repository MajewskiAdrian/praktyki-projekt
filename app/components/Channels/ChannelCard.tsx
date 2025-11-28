"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

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
  members?: Array<{ role: string }>;
}

export default function ChannelCard({ channel, onDelete }: { channel: Channel; onDelete?: (id: string) => void }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/users/profile', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user?.id || null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    fetchUser();
  }, [channel.owner.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    }

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  const isOwner = currentUserId === channel.owner.id;
  const userRole = channel.members?.[0]?.role;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this channel? This action cannot be undone.')) {
      return;
    }

    try {
      setIsDeleting(true);
      const res = await fetch(`/api/channels/${channel.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete channel');
      }

      // Notify parent to remove channel immediately from UI if handler provided
      if (onDelete) {
        onDelete(channel.id);
      } else {
        // fallback to refresh
        router.refresh();
      }
    } catch (error: any) {
      console.error('Error deleting channel:', error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  return (
    <Link href={`/channels/${channel.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer h-full flex flex-col group relative">
        {isOwner && (
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4" ref={settingsRef}>
            <button
              onClick={toggleSettings}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              title="Settings"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>

            {showSettings && (
              <div className="absolute top-10 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isDeleting ? 'Deleting...' : 'Delete Channel'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 pr-8">
          {channel.avatarUrl ? (
            <img
              src={channel.avatarUrl}
              alt={channel.title}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-amber-500 transition-all"
            />
          ) : (
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-amber-500 transition-all">
              {channel.title.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-start gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white break-words group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors max-w-full">
                {channel.title}
              </h3>
              {!channel.isPublic && (
                <span className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="hidden xs:inline">Private</span>
                </span>
              )}
            </div>

            {userRole && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {userRole === 'OWNER' && (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Owner
                  </span>
                )}
                {userRole === 'MODERATOR' && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                    <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Mod
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {channel.description && (
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 sm:mb-4 flex-1 break-words">
            {channel.description}
          </p>
        )}

        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {channel._count?.members || 0}
            </span>
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {channel._count?.messages || 0}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full xs:max-w-[120px]" title={`Created by ${channel.owner.name}`}>
            by {channel.owner.name}
          </span>
        </div>
      </div>
    </Link>
  );
}