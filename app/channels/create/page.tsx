import CreateChannelForm from '@/app/components/Channels/CreateChannelForm';

export default function CreateChannelPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Channel</h1>
      <CreateChannelForm />
    </div>
  );
}