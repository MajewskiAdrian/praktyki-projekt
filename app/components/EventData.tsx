import { useEffect, useState } from "react";
import JoinEventButton from "./JoinEventButton";
import EventAttendees from "./EventAttendees";

export default function EventData({
  event,
  onClose,
}: {
  event: any;
  onClose: () => void;
}) {
  return (
    <div className="absolute inset-0 bg-white dark:bg-gray-800 z-50 flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <h3 className="text-2xl font-bold text-black dark:text-white">
          {event.title}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white text-3xl font-bold leading-none ml-4"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Description
            </h4>
            <p className="text-black dark:text-white text-base">
              {event.description}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Location
            </h4>
            <p className="text-black dark:text-white text-sm">
              📍 {event.latitude}, {event.longitude}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
              Date & Time
            </h4>
            <p className="text-black dark:text-white text-sm">
              🗓️{" "}
              {new Date(event.eventDate).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <EventAttendees eventId={String(event.id)} />
          </div> 
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <JoinEventButton 
              key={event.id} // Upewnij się że key jest ustawiony
              eventId={event.id} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
