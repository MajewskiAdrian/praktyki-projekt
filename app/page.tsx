"use client";
import dynamic from "next/dynamic";

// dynamiczny import komponentu (bo Leaflet działa tylko po stronie klienta)
const Map = dynamic(() => import("./components/Map"), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="bg-gray-300 flex justify-between items-center px-6 py-4 mb-6 rounded-b-sm">
        <div className="text-black font-semibold">Nazwa</div>
        <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
      </header>

      {/* Simplified, resilient layout: fixed-height map wrapper to avoid 0px height issues */}
      <section className="p-6 grid grid-cols-3 gap-6 h-[calc(100vh-80px)] overflow-hidden">
        {/* Lewa kolumna z mapą */}
        <div className="col-span-2 bg-gray-300 rounded-lg overflow-hidden">
          <Map />
        </div>

        {/* Prawa kolumna – tylko ta ma scroll */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="bg-gray-300 rounded-lg h-[180px] shrink-0"></div>
          <div className="bg-gray-300 rounded-lg h-[180px] shrink-0"></div>
          <div className="bg-gray-300 rounded-lg h-[180px] shrink-0"></div>
          <div className="bg-gray-300 rounded-lg h-[180px] shrink-0"></div>
          <div className="bg-gray-300 rounded-lg h-[180px] shrink-0"></div>
        </div>
      </section>
    </main>
  );
}
