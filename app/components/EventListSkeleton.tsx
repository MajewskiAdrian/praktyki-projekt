"use client";
import React from "react";

export default function EventListSkeleton({ count = 5 }: { count?: number }) {
  const items = Array.from({ length: count }).map((_, i) => i);

  return (
    <div className="p-4 space-y-2">
      {items.map((idx) => (
        <div
          key={idx}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm flex flex-col gap-3"
          aria-hidden
        >
          <div className="skeleton skeleton-title bg-gray-200 dark:bg-gray-700"></div>
          <div className="skeleton skeleton-desc bg-gray-200 dark:bg-gray-700"></div>
          <div className="flex gap-2 items-center">
            <div className="skeleton skeleton-tags bg-gray-200 dark:bg-gray-700"></div>
            <div className="skeleton skeleton-line bg-gray-200 dark:bg-gray-700"></div>
          </div>
          <div className="skeleton skeleton-line bg-gray-200 dark:bg-gray-700 w-1/3"></div>
        </div>
      ))}
    </div>
  );
}
