'use client';

import { useState, useEffect } from 'react';

type Location = {
  id: string | number;
  label: string;
  lat: number;
  lng: number;
};

type Props = {
  onSelectLocation: (loc: Location) => void;
  initialQuery?: string;
  endpoint: string; // <--- NOWE
};

export default function LocationSearch({ onSelectLocation, initialQuery, endpoint }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof initialQuery === 'string') setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${endpoint}?q=${encodeURIComponent(query)}`); // <--- TU
      if (!res.ok) {
        throw new Error('Request failed');
      }
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError('Nie udało się wyszukać adresu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter address, city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-amber-500 text-white px-4 py-2 rounded font-medium hover:bg-amber-600 transition-colors shadow-sm shadow-amber-500/30"
        >
          Search
        </button>
      </form>

      {loading && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
      {error && <div className="mt-2 text-sm text-red-500">{error}</div>}

      {results.length > 0 && (
        <ul className="mt-2 border rounded bg-white max-h-60 overflow-auto shadow-lg dark:bg-gray-700">
          {results.map((r) => (
            <li
              key={r.id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm dark:hover:bg-gray-600"
              onClick={() => {
                onSelectLocation(r);
                setResults([]);
                setQuery('');
              }}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
