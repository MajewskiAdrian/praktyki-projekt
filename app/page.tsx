'use client';
import dynamic from 'next/dynamic';

// dynamiczny import komponentu (bo Leaflet działa tylko po stronie klienta)
const Map = dynamic(() => import('./components/Map'), { ssr: false });

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <header className="bg-gray-300 flex justify-between items-center px-6 py-4">
        <div className="text-black font-semibold">Nazwa</div>
        <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
      </header>

      <section className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-300 rounded-lg h-[400px] overflow-hidden">
          <Map />
        </div>
        <div className="flex flex-col gap-6">
          <div className="bg-gray-300 rounded-lg h-[180px]"></div>
          <div className="bg-gray-300 rounded-lg h-[180px]"></div>
        </div>
      </section>
    </main>
  );
}
