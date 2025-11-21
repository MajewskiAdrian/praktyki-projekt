import ChannelList from '@/app/components/Channels/ChannelList';
import Link from 'next/link';

export default async function ChannelsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Channels</h1>
        <Link
          href="/channels/create"
          className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
        >
          + Create Channel
        </Link>
      </div>

      <ChannelList />
    </div>
  );
}