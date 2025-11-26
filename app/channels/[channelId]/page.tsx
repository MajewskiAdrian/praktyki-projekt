import MessageFeed from '@/app/components/Channels/MessageFeed';
import SendMessageForm from '@/app/components/Channels/SendMessageForm';
import FollowButton from '@/app/components/Channels/FollowButton';
import CircleMenu from '@/app/components/CircleMenu';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Link from 'next/link';

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.id || decoded.userId;
  } catch {
    return null;
  }
}

export default async function ChannelPage({ 
  params 
}: { 
  params: Promise<{ channelId: string }> 
}) {
  const resolvedParams = await params;
  const userId = await getCurrentUser();
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/channels/${resolvedParams.channelId}`,
    { 
      cache: 'no-store',
      headers: userId ? { 'x-user-id': userId } : {}
    }
  );

  if (!res.ok) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Venn</span>
            </div>
            <CircleMenu />
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Channel not found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">This channel doesn't exist or you don't have access to it.</p>
            <Link 
              href="/channels" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to channels
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const channel = await res.json();

  // Sprawdź czy użytkownik jest członkiem
  let isMember = false;
  let memberRole = null;
  
  if (userId) {
    try {
      const memberRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/channels/${resolvedParams.channelId}/members`,
        { 
          cache: 'no-store',
          headers: { 'x-user-id': userId }
        }
      );
      
      if (memberRes.ok) {
        const members = await memberRes.json();
        const userMember = members.find((m: any) => m.user.id === userId);
        isMember = !!userMember;
        memberRole = userMember?.role;
      }
    } catch (error) {
      console.error('Failed to check membership:', error);
    }
  }

  const canSendMessages = memberRole === 'OWNER' || memberRole === 'MODERATOR';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Venn</span>
          </div>
          <CircleMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link 
          href="/channels" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to channels
        </Link>

        {/* Channel Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              {channel.avatarUrl ? (
                <img 
                  src={channel.avatarUrl} 
                  alt={channel.title}
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-700 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl ring-4 ring-gray-100 dark:ring-gray-700 flex-shrink-0">
                  {channel.title.charAt(0).toUpperCase()}
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{channel.title}</h1>
                  {!channel.isPublic && (
                    <span className="bg-gray-800 dark:bg-gray-700 text-white text-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Private
                    </span>
                  )}
                  {memberRole && (
                    <>
                      {memberRole === 'OWNER' && (
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 text-sm px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Owner
                        </span>
                      )}
                      {memberRole === 'MODERATOR' && (
                        <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Moderator
                        </span>
                      )}
                      {memberRole === 'FOLLOWER' && (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-sm px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Following
                        </span>
                      )}
                    </>
                  )}
                </div>
                
                {channel.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{channel.description}</p>
                )}
                
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-medium">{channel._count?.members || 0}</span> followers
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-medium">{channel._count?.messages || 0}</span> messages
                  </span>
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    by <span className="font-medium">{channel.owner.name}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Follow Button */}
            {userId && userId !== channel.ownerId && (
              <div className="flex-shrink-0">
                <FollowButton 
                  channelId={resolvedParams.channelId} 
                  initialFollowing={isMember}
                />
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        {!userId ? (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">Login Required</h3>
            <p className="text-amber-800 dark:text-amber-200 mb-6">Please log in to follow this channel and see messages</p>
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Log In
            </a>
          </div>
        ) : !isMember ? (
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join this channel</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Follow this channel to see messages and participate in discussions</p>
            <FollowButton 
              channelId={resolvedParams.channelId} 
              initialFollowing={false}
            />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Message Form (tylko dla owner/mod) */}
            {canSendMessages && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Post a message
                </h2>
                <SendMessageForm channelId={resolvedParams.channelId} />
              </div>
            )}

            {/* Message Feed */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Messages
                </h2>
              </div>
              <MessageFeed channelId={resolvedParams.channelId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}