"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import EventsList, { MembershipFilter } from "./components/EventsList";
import EventData from "./components/EventData";
import CircleMenu from "./components/CircleMenu";
import AddEventForm from "./components/AddEventForm";
import { useState, useCallback } from "react";

const Map = dynamic(() => import("./components/Map"), { ssr: false });

interface MyEvent {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  eventDate: string;
  tags?: any[];
}

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [focusedEventId, setFocusedEventId] = useState<number | null>(null);
  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<MyEvent | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [createEventLocation, setCreateEventLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Shared filter state
  const [searchText, setSearchText] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [membershipFilter, setMembershipFilter] = useState<MembershipFilter>("all");

  const handleEventAdded = (newEvent: MyEvent) => {
    setRefreshKey((prev) => prev + 1);
    setFocusedEventId(newEvent.id);
    setCreateEventLocation(null); // Zamknij formularz
  };

  const handleEventClick = useCallback((event: MyEvent) => {
    setSelectedEvent(event);
    setFocusedEventId(event.id);
    setCreateEventLocation(null); // Zamknij formularz przy kliknięciu w event
  }, []);

  const handleLocationSearch = useCallback(
    (location: { lat: number; lng: number }) => {
      setSearchLocation(location);
      setFocusedEventId(null);
    },
    []
  );

  const handleCreateEventClick = useCallback((lat: number, lng: number) => {
    setCreateEventLocation({ lat, lng });
    setSelectedEvent(null); // Zamknij EventData
  }, []);

  const handleCloseCreateEvent = useCallback(() => {
    setCreateEventLocation(null);
  }, []);

  return (
    <main className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center px-6 py-3 relative z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="Venn Logo" width={100} height={40} />
        </div>
        <CircleMenu />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map Section */}
        <div className="flex-1 relative">
          <Map
            onEventAdded={handleEventAdded}
            focusedEventId={focusedEventId}
            onLocationSearch={handleLocationSearch}
            searchLocation={searchLocation}
            onEventClick={handleEventClick}
            onCreateEventClick={handleCreateEventClick}
          />
        </div>

        {/* Right Sidebar */}
        <aside
          className={`
          bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 
          transition-all duration-300 ease-in-out shadow-xl
          ${isSearchExpanded ? "w-[32rem]" : "w-0"}
          overflow-hidden flex flex-col
        `}
        >
          {/* Search Section */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Events
                </h2>
                <button
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Toggle filters"
                >
                  <svg 
                    className={`w-5 h-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Filters - Collapsible with smooth animation */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isFilterExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-5 pb-5 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <EventsList
                  key={refreshKey}
                  selectedEvent={selectedEvent}
                  setSelectedEvent={setSelectedEvent}
                  onEventClick={handleEventClick}
                  filtersOnly={true}
                  useModal={false}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  selectedTags={selectedTags}
                  setSelectedTags={setSelectedTags}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  membershipFilter={membershipFilter}
                  setMembershipFilter={setMembershipFilter}
                />
              </div>
            </div>
          </div>

          {/* Events List / Details / Create Form */}
          <div className="flex-1 overflow-hidden">
            {createEventLocation ? (
              // Show create form
              <div className="h-full overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Stwórz nowe wydarzenie</h2>
                  <button
                    onClick={handleCloseCreateEvent}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-6">
                  <AddEventForm
                    lat={createEventLocation.lat}
                    lng={createEventLocation.lng}
                    onEventAdded={handleEventAdded}
                  />
                </div>
              </div>
            ) : selectedEvent ? (
              // Show event details
              <div className="h-full">
                <EventData event={selectedEvent as any} onClose={() => setSelectedEvent(null)} />
              </div>
            ) : (
              // Show events list
              <EventsList
                key={refreshKey}
                selectedEvent={selectedEvent}
                setSelectedEvent={setSelectedEvent}
                onEventClick={handleEventClick}
                filtersOnly={false}
                useModal={false}
                searchText={searchText}
                setSearchText={setSearchText}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                membershipFilter={membershipFilter}
                setMembershipFilter={setMembershipFilter}
              />
            )}
          </div>
        </aside>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSearchExpanded(!isSearchExpanded)}
          className={`
            fixed top-1/2 -translate-y-1/2 z-50
            bg-amber-500 hover:bg-amber-600 text-white
            p-3 rounded-l-lg shadow-lg
            transition-all duration-300 ease-in-out
            hover:scale-110
          `}
          style={{
            right: isSearchExpanded ? "512px" : "0",
          }}
          aria-label={isSearchExpanded ? "Zwiń panel" : "Rozwiń panel"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isSearchExpanded ? "rotate-0" : "rotate-180"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </main>
  );
}
