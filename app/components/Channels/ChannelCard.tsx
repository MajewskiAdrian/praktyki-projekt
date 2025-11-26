import Link from 'next/link';

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

export default function ChannelCard({ channel }: { channel: Channel }) {
  const userRole = channel.members?.[0]?.role;

  return (
    <Link href={`/channels/${channel.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer h-full flex flex-col group">
        <div className="flex items-start gap-4 mb-4">
          {channel.avatarUrl ? (
            <img 
              src={channel.avatarUrl} 
              alt={channel.title}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-amber-500 transition-all"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-amber-500 transition-all">
              {channel.title.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {channel.title}
              </h3>
              {!channel.isPublic && (
                <span className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Private
                </span>
              )}
            </div>
            
            {userRole && (
              <div className="flex gap-2 mb-2">
                {userRole === 'OWNER' && (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Owner
                  </span>
                )}
                {userRole === 'MODERATOR' && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
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
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
            {channel.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {channel._count?.members || 0}
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {channel._count?.messages || 0}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]" title={`Created by ${channel.owner.name}`}>
            by {channel.owner.name}
          </span>
        </div>
      </div>
    </Link>
  );
}