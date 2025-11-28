"use client";
import React from 'react';

interface ListSortProps {
  sortBy: "date" | "title" | "distance";
  setSortBy: (sort: "date" | "title" | "distance") => void;
  onUseLocation?: (coords: { lat: number; lng: number } | null, error?: string) => void;
}

export default function ListSort({ sortBy, setSortBy, onUseLocation }: ListSortProps) {
  const [locLoading, setLocLoading] = React.useState(false);

  const requestLocation = () => {
    if (!navigator?.geolocation) {
      if (onUseLocation) onUseLocation(null, "Your browser does not support geolocation.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocLoading(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        // switch sorting to distance
        setSortBy("distance");
        if (onUseLocation) onUseLocation(coords);
      },
      (err) => {
        setLocLoading(false);
        let friendly = err?.message || "An error occurred while retrieving location.";
        // map common permission denied message to a nicer English message
        try {
          // some browsers set code === 1 for permission denied
          if ((err as any)?.code === 1 || /user denied|permission denied/i.test(String(err?.message))) {
            friendly = "Location access was denied. Allow the app to use your location to sort events by distance.";
          }
        } catch (e) {
          // ignore
        }
        if (onUseLocation) onUseLocation(null, friendly);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as "date" | "title" | "distance")}
        className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="date">Date</option>
        <option value="title">Title</option>
        <option value="distance">Distance</option>
      </select>

      <button
        type="button"
        onClick={requestLocation}
        className="ml-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded"
        title="Use my location"
      >
        {locLoading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
          </svg>
        )}
        <span className="text-sm">Use my location</span>
      </button>
    </div>
  );
}