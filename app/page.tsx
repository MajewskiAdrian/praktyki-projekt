"use client";
import dynamic from "next/dynamic";
import EventsList from "./components/EventsList";
import CircleMenu from "./components/CircleMenu";
import { useState, useCallback } from "react";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [focusedEventId, setFocusedEventId] = useState<number | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleEventAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const handleEventClick = useCallback((eventId: number) => {
    setFocusedEventId(eventId);
    setSearchLocation(null); // Reset search location
    // Reset po animacji
    setTimeout(() => setFocusedEventId(null), 3000);
  }, []);

  const handleLocationSearch = useCallback((location: { lat: number; lng: number }) => {
    setSearchLocation(location);
    setFocusedEventId(null); // Reset focused event
  }, []);

  return (
    <main className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <header className="bg-gray-300 dark:bg-gray-800 flex justify-between items-center px-6 py-4 mb-6 rounded-b-sm">
        <div className="text-black dark:text-white font-semibold m-0">Venn</div>
        <CircleMenu />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 w-full overflow-hidden p-6">
        <div className="bg-gray-300 dark:bg-gray-800 rounded-lg h-full w-full overflow-hidden">
          <Map 
            key={`map-${refreshKey}`} 
            onEventAdded={handleEventAdded}
            focusedEventId={focusedEventId}
            onLocationSearch={handleLocationSearch}
            searchLocation={searchLocation}
          />
        </div>

        <div className="flex flex-col gap-6 h-full w-full pr-2">
          <div
            className="bg-gray-300 dark:bg-gray-800 rounded-lg overflow-y-auto scrollbar-hide"
            style={{ height: 'calc(100vh - 8rem)' }} 
          >
            <EventsList 
              key={refreshKey}
              onEventClick={handleEventClick}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
