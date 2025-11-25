"use client";
import React from "react";

export default function LoadingPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex flex-col items-center gap-4">
        {/* Replace `/public/logo.png` with your logo later */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center bg-white/0">
          <img src="/logo.png" alt="logo" className="w-20 h-20 animate-[spin_6s_linear_infinite] opacity-90" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold">Loading</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Proszę chwilę poczekać…</p>
        </div>

        <div className="mt-2 w-32 h-2 rounded-full bg-gray-200 dark:bg-gray-700 loader-pulse" aria-hidden></div>
      </div>
    </div>
  );
}
