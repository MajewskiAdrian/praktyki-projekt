export default function EventDataSkeleton({ onClose }: { onClose: () => void }) {
  return (
    <div className="relative h-full bg-white dark:bg-gray-800 flex flex-col">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <div className="h-8 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/3 animate-shimmer bg-size-[200%_100%]" />
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white text-3xl font-bold leading-none ml-4"
        >
          ×
        </button>
      </div>

  <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 animate-shimmer bg-size-[200%_100%]" />
            <div className="space-y-2">
              <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full animate-shimmer bg-size-[200%_100%]" />
              <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-4/5 animate-shimmer bg-size-[200%_100%]" />
              <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/5 animate-shimmer bg-size-[200%_100%]" />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-shimmer bg-size-[200%_100%]" />
            <div className="h-5 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/3 animate-shimmer bg-size-[200%_100%]" />
          </div>

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-28 animate-shimmer bg-size-[200%_100%]" />
            <div className="h-5 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 animate-shimmer bg-size-[200%_100%]" />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <div className="h-4 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 animate-shimmer bg-size-[200%_100%]" />
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-size-[200%_100%]" />
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-size-[200%_100%]" />
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-size-[200%_100%]" />
            </div>
          </div>

          {/* Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="h-12 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-shimmer bg-size-[200%_100%]" />
          </div>
        </div>
      </div>
    </div>
  );
}