"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function CircleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleNavigation = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  const handleThemeChange = () => {
    // Przeładuj stronę po zmianie motywu w settings
    router.push('/settings');
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-lg transition-all"
      >
        {isOpen ? "×" : "☰"}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-1000 overflow-hidden">
            <button
              onClick={() => handleNavigation("/dashboard")}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleThemeChange}
              className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
            >
              Settings
            </button>
            <li className="w-full text-left px-4 py-3 text-red-600 hover:text-gray-50 hover:bg-red-500  dark:hover:bg-gray-700 dark:text-gray-200 transition-colors">
              <LogoutButton />
            </li>
          </div>
        </>
      )}
    </div>
  );
}