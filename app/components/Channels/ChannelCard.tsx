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
  members?: Array<{ role: string }>; // Opcjonalnie z GET
}

export default function ChannelCard({ channel }: { channel: Channel }) {
  const userRole = channel.members?.[0]?.role;

  return (
    <Link href={`/channels/${channel.id}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white cursor-pointer h-full flex flex-col">
        <div className="flex items-start gap-3 mb-3">
          {channel.avatarUrl ? (
            <img 
              src={channel.avatarUrl} 
              alt={channel.title}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {channel.title.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg truncate">{channel.title}</h3>
              {!channel.isPublic && (
                <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                  🔒 Private
                </span>
              )}
              {userRole === 'OWNER' && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">
                  👑 Owner
                </span>
              )}
              {userRole === 'MODERATOR' && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  🛡️ Mod
                </span>
              )}
            </div>
            
            {channel.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {channel.description}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-3 border-t">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              👥 {channel._count?.members || 0}
            </span>
            <span className="flex items-center gap-1">
              💬 {channel._count?.messages || 0}
            </span>
          </div>
          <span className="text-xs truncate max-w-[120px]" title={channel.owner.name}>
            by {channel.owner.name}
          </span>
        </div>
      </div>
    </Link>
  );
}