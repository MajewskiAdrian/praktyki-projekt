"use client";

import { useState } from "react";
import Link from "next/link";
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
        <div className="absolute top-0 z-1000 right-12 bg-gray-500 rounded-lg shadow-lg p-2 w-50">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="block hover:bg-gray-100 hover:text-gray-900 px-3 py-1 text-gray-50 rounded cursor-pointer transition-colors duration-500 ease-in-out"
                onClick={() => setOpen(false)}
            >
              Account
            </Link>
            </li>
            <li>
              <Link
                href="/settings"
                className="block hover:bg-gray-100 hover:text-gray-900 px-3 py-1 text-gray-50 rounded cursor-pointer transition-colors duration-500 ease-in-out"
                onClick={() => setOpen(false)} // zamknij menu po kliknięciu
              >
                Settings
              </Link>
            </li>
            <li className="hover:bg-red-600 px-0 py-0 text-gray-50 rounded transition-colors duration-500 ease-in-out">
              <LogoutButton />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}