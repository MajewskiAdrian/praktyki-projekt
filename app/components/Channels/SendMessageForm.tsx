'use client';

import { useState } from 'react';

type MessageType = 'TEXT' | 'ANNOUNCEMENT' | 'POLL' | 'IMAGE';

export default function SendMessageForm({ channelId }: { channelId: string }) {
  const [text, setText] = useState('');
  const [type, setType] = useState<MessageType>('TEXT');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const handleImageUrlChange = (value: string) => {
    setImageUrl(value);
    setImagePreviewError(false); // Reset błędu przy każdej zmianie
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let content: any = {};

      if (type === 'TEXT' || type === 'ANNOUNCEMENT') {
        if (!text.trim()) {
          setError('Message cannot be empty');
          setLoading(false);
          return;
        }
        content = { text: text.trim() };
      } else if (type === 'IMAGE') {
        if (!imageUrl.trim()) {
          setError('Image URL is required');
          setLoading(false);
          return;
        }
        content = { 
          imageUrl: imageUrl.trim(),
          text: text.trim() || undefined
        };
      } else if (type === 'POLL') {
        if (!pollQuestion.trim()) {
          setError('Poll question is required');
          setLoading(false);
          return;
        }
        
        const validOptions = pollOptions.filter(opt => opt.trim());
        if (validOptions.length < 2) {
          setError('Poll must have at least 2 options');
          setLoading(false);
          return;
        }

        content = {
          question: pollQuestion.trim(),
          options: validOptions.map((opt, i) => ({ 
            id: String(i + 1), 
            text: opt.trim() 
          }))
        };
      }

      const res = await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ type, content })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      // Reset form
      setText('');
      setPollQuestion('');
      setPollOptions(['', '']);
      setImageUrl('');
      setType('TEXT');
      setImagePreviewError(false);
      
      // Reload page to show new message
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-6 bg-white shadow-sm">
      <h3 className="font-semibold mb-3">Send Message</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => setType('TEXT')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'TEXT' 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          💬 Text
        </button>
        <button
          type="button"
          onClick={() => setType('ANNOUNCEMENT')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'ANNOUNCEMENT' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📢 Announcement
        </button>
        <button
          type="button"
          onClick={() => setType('POLL')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'POLL' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          📊 Poll
        </button>
        <button
          type="button"
          onClick={() => setType('IMAGE')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'IMAGE' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🖼️ Image
        </button>
      </div>

      <form onSubmit={sendMessage}>
        {/* TEXT or ANNOUNCEMENT */}
        {(type === 'TEXT' || type === 'ANNOUNCEMENT') && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              type === 'ANNOUNCEMENT' 
                ? 'Important announcement...' 
                : 'Type your message...'
            }
            className="w-full border rounded p-3 mb-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            rows={3}
            required
          />
        )}

        {/* IMAGE */}
        {type === 'IMAGE' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL *
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter a direct link to an image (jpg, png, gif, webp)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption (optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a caption for your image..."
                className="w-full border rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                rows={2}
              />
            </div>

            {/* Image Preview */}
            {imageUrl && !imagePreviewError && (
              <div className="border rounded-lg p-2 bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-64 rounded border object-contain"
                  onError={() => setImagePreviewError(true)}
                  onLoad={() => setImagePreviewError(false)}
                />
              </div>
            )}

            {/* Error message for invalid image */}
            {imageUrl && imagePreviewError && (
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-3 py-2 rounded text-sm">
                ⚠️ Cannot load image preview. Make sure the URL is correct and publicly accessible.
              </div>
            )}
          </div>
        )}

        {/* POLL */}
        {type === 'POLL' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poll Question *
              </label>
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What's your question?"
                className="w-full border rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options (min. 2):
              </label>
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="flex items-center justify-center w-8 h-10 text-gray-500 font-medium">
                      {i + 1}.
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      required={i < 2}
                    />
                    {i >= 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPollOptions(pollOptions.filter((_, idx) => idx !== i));
                        }}
                        className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {pollOptions.length < 10 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                + Add option
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (type === 'IMAGE' && imagePreviewError)}
          className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}