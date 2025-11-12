"use client";
import dynamic from "next/dynamic";
import EventsList from "./components/EventsList";
import AddEventForm from "./components/AddEventForm";
import { Circle } from "react-leaflet";
import CircleMenu from "./components/CircleMenu";
import { useState, useCallback } from "react";
import DeleteEventButton from "./components/DeleteEventButton";

// import of component with leaflet map, client-side only
const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

const handleEventAdded = useCallback(() => {
  setRefreshKey((prev) => prev + 1);
}, []);
  return (
    <main className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <header className="bg-gray-300 flex justify-between items-center px-6 py-4 mb-6 rounded-b-sm">
        <div className="text-black font-semibold m-0">Venn</div>
        
        <CircleMenu />
      </header>

      {/* layout: section fills remaining height */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0 w-full overflow-hidden p-6">
        {/* Left collumn - map*/}
        <div className="bg-gray-300 rounded-lg h-full w-full overflow-hidden">
          <Map key={`map-${refreshKey}`} onEventAdded={handleEventAdded} />
        </div>

        {/* right collumn - scrolling list */}
        <div className="flex flex-col gap-6 h-full w-full pr-2">
          <div
            className="bg-gray-300 rounded-lg overflow-y-auto scrollbar-hide"
            style={{ height: 'calc(100vh - 8rem)' }} 
          >
            <EventsList key={refreshKey} />
          </div>
        </div>
      </section>
    </main>
  );
}
