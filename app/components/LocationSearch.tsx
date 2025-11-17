'use client';

import { useState } from 'react';

type Location = {
  id: string | number;
  label: string;
  lat: number;
  lng: number;
};

type Props = {
  onSelectLocation: (loc: Location) => void;
};

export default function LocationSearch({ onSelectLocation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
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
          placeholder="Wpisz adres, miasto..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Szukaj
        </button>
      </form>

      {loading && <div className="mt-2 text-sm text-gray-500">Szukam...</div>}
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