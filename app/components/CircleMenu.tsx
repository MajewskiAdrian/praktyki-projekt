"use client";
import { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function CircleMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Kółko */}
      <div
        onClick={() => setOpen(!open)}
        className="w-10 h-10 bg-gray-500 rounded-full cursor-pointer hover:bg-gray-600"
      ></div>

      {/* Lista opcji (pokazuje się tylko, gdy open === true) */}
      {open && (
        <div className="absolute top-0 right-12 bg-gray-500 rounded-lg shadow-lg p-2 w-50">
          <ul className="space-y-1">
            <li className="hover:bg-gray-100 px-3 py-1 rounded cursor-pointer transition-colors duration-500 ease-in-out">
              Account settings
            </li>
            <li className="hover:bg-gray-100 px-3 py-1 rounded cursor-pointer transition-colors duration-500 ease-in-out">
              Settings
            </li>
            <li className="hover:bg-red-600 px-0 py-0 rounded transition-colors duration-500 ease-in-out">
              <LogoutButton />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}