"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function CircleMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const MENU_WIDTH = 192; // odpowiada w-48

  const menuItems = [
    { href: "/", label: "Map", icon: "" },
    { href: "/dashboard", label: "Dashboard", icon: "" },
    { href: "/channels", label: "Channels", icon: "" },
    { href: "/settings", label: "Settings", icon: "" },
  ];

  // Ustaw pozycję menu względem przycisku
  const updatePosition = () => {
    const btn = buttonRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const margin = 8;
    const left = Math.min(
      Math.max(margin, r.right - MENU_WIDTH),
      window.innerWidth - MENU_WIDTH - margin
    );
    const top = Math.min(r.bottom + 8, window.innerHeight - 8 - 200); // zapobiega wyjściu poza ekran
    setPos({ top, left });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        menuRef.current &&
        buttonRef.current &&
        target &&
        !menuRef.current.contains(target) &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  // Menu JSX renderowane w portal, aby ominąć stacking context i overlaye
  const menu = isOpen ? (
    <div
      ref={menuRef}
      id="circle-menu"
      role="menu"
      aria-orientation="vertical"
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: `${MENU_WIDTH}px`,
        zIndex: 9999,
      }}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1"
    >
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          role="menuitem"
          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => setIsOpen(false)}
        >
          {item.label}
        </Link>
      ))}

      <div className="border-t border-gray-100 dark:border-gray-700 mt-1">
        <div className="px-4 py-2">
          <LogoutButton />
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" aria-haspopup="true">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="circle-menu"
        className="w-12 h-12 rounded-full bg-amber-500 text-white shadow flex items-center justify-center text-xl focus:outline-none"
        aria-label="Toggle menu"
      >
        ☰
      </button>

      {typeof document !== "undefined" && createPortal(menu, document.body)}
    </div>
  );
}