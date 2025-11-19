import MessageFeed from '@/app/components/Channels/MessageFeed';
import SendMessageForm from '@/app/components/Channels/SendMessageForm';
import FollowButton from '@/app/components/Channels/FollowButton';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600">Channel not found</h1>
          <a href="/channels" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to channels
          </a>
        </div>
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
    <div className="max-w-4xl mx-auto p-6">
      {/* Channel Header */}
      <div className="mb-6 border-b pb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {channel.avatarUrl ? (
              <img 
                src={channel.avatarUrl} 
                alt={channel.title}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl">
                {channel.title.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{channel.title}</h1>
              {channel.description && (
                <p className="text-gray-600 mt-1">{channel.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>👥 {channel._count?.members || 0} followers</span>
                <span>💬 {channel._count?.messages || 0} messages</span>
                <span>👤 by {channel.owner.name}</span>
              </div>
            </div>
          </div>

          {/* Follow/Unfollow Button */}
          {userId && userId !== channel.ownerId && (
            <FollowButton 
              channelId={resolvedParams.channelId} 
              initialFollowing={isMember}
            />
          )}
        </div>

        {/* Member status indicator */}
        {isMember && (
          <div className="mt-4 flex items-center gap-2">
            {memberRole === 'OWNER' && (
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                👑 Owner
              </span>
            )}
            {memberRole === 'MODERATOR' && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                🛡️ Moderator
              </span>
            )}
            {memberRole === 'FOLLOWER' && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Following
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content based on membership */}
      {!userId ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 mb-4">Please log in to follow this channel and see messages</p>
          <a 
            href="/login" 
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Log In
          </a>
        </div>
      ) : !isMember ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-700 mb-4">Follow this channel to see messages and participate</p>
          <FollowButton 
            channelId={resolvedParams.channelId} 
            initialFollowing={false}
          />
        </div>
      ) : (
        <>
          {/* Message Form (tylko dla owner/mod) */}
          {canSendMessages && (
            <SendMessageForm channelId={resolvedParams.channelId} />
          )}

          {/* Message Feed */}
          <MessageFeed channelId={resolvedParams.channelId} />
        </>
      )}
    </div>
  );
}