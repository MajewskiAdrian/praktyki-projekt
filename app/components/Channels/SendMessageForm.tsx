'use client';

import { useState } from 'react';

// Small inline SVG icons to avoid adding a dependency. They accept a `className` prop
// so Tailwind classes can control size/color.
const IconChat = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 12c0 4.97-4.03 9-9 9a8.96 8.96 0 01-4.95-1.49L3 21l1.49-3.06A8.96 8.96 0 013 12c0-4.97 4.03-9 9-9s9 4.03 9 9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMegaphone = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M3 11v2a2 2 0 002 2h1l6 3V6L6 9H5a2 2 0 00-2 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 8a4 4 0 010 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPoll = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M7 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconImage = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 14l2.5-3 3.5 4.5 2.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="9" r="1" fill="currentColor" />
  </svg>
);

const IconWarning = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 9v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 17h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.29 3.86L2.82 18.14A2 2 0 004.61 21h14.78a2 2 0 001.79-2.86L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconX = ({ className = '' }: any) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

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
    setImagePreviewError(false);
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
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6 bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Send Message</h3>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-200 px-3 py-2 rounded mb-3 text-sm">
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
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <IconChat className="inline-block w-4 h-4 mr-2" />
          Text
        </button>
        <button
          type="button"
          onClick={() => setType('ANNOUNCEMENT')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'ANNOUNCEMENT' 
              ? 'bg-yellow-500 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <IconMegaphone className="inline-block w-4 h-4 mr-2" />
          Announcement
        </button>
        <button
          type="button"
          onClick={() => setType('POLL')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'POLL' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <IconPoll className="inline-block w-4 h-4 mr-2" />
          Poll
        </button>
        <button
          type="button"
          onClick={() => setType('IMAGE')}
          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            type === 'IMAGE' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <IconImage className="inline-block w-4 h-4 mr-2" />
          Image
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
            className="w-full border border-gray-300 dark:border-gray-600 rounded p-3 mb-3 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            rows={3}
            required
          />
        )}

        {/* IMAGE */}
        {type === 'IMAGE' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL *
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enter a direct link to an image (jpg, png, gif, webp)
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Caption (optional)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a caption for your image..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                rows={2}
              />
            </div>

            {/* Image Preview */}
            {imageUrl && !imagePreviewError && (
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-64 rounded border border-gray-200 dark:border-gray-600 object-contain"
                  onError={() => setImagePreviewError(true)}
                  onLoad={() => setImagePreviewError(false)}
                />
              </div>
            )}

            {/* Error message for invalid image */}
            {imageUrl && imagePreviewError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded text-sm flex items-start gap-2">
                <IconWarning className="w-4 h-4 mt-0.5" />
                <div>Cannot load image preview. Make sure the URL is correct and publicly accessible.</div>
              </div>
            )}
          </div>
        )}

        {/* POLL */}
        {type === 'POLL' && (
          <div className="space-y-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Poll Question *
              </label>
              <input
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                placeholder="What's your question?"
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Options (min. 2):
              </label>
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="flex items-center justify-center w-8 h-10 text-gray-500 dark:text-gray-400 font-medium">
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
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      required={i < 2}
                    />
                    {i >= 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPollOptions(pollOptions.filter((_, idx) => idx !== i));
                        }}
                        className="px-3 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors flex items-center"
                        aria-label={`Remove option ${i + 1}`}
                      >
                        <IconX className="w-4 h-4" />
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
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
              >
                + Add option
              </button>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || (type === 'IMAGE' && imagePreviewError)}
          className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}