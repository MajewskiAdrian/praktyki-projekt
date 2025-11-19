"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function CircleMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Map", icon: "" },
    { href: "/dashboard", label: "Dashboard", icon: "" },
    { href: "/channels", label: "Channels", icon: "" },
    { href: "/settings", label: "Settings", icon: "" },
  ];

  return (
    <div className="fixed top-6 right-6 z-9999">
      {/* Menu Items - wyświetlane gdy isOpen */}
      {isOpen && (
        <div className="absolute top-0 right-20 flex flex-col gap-3">
          {menuItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 bg-white border-2 border-blue-500 rounded-2xl px-4 py-3 shadow-lg hover:bg-blue-50 transition-all hover:scale-110 animate-in slide-in-from-right fade-in duration-300"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
          
          {/* Logout Button */}
          <div 
            className="bg-white border-2 border-red-500 rounded-2xl px-4 py-3 shadow-lg hover:bg-red-50 transition-all hover:scale-110 animate-in slide-in-from-right fade-in duration-300"
            style={{
              animationDelay: `${menuItems.length * 100}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <LogoutButton />
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full bg-blue-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center text-2xl ${
          isOpen ? "rotate-0" : ""
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? "☰" : "☰"}
      </button>
    </div>
  );
}