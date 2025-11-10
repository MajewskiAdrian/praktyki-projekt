"use client";
import React, { useState, useEffect } from "react";

export default function DisplayPanel() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  } else {
    root.classList.remove("dark");
    root.setAttribute("data-theme", "light");
  }

  localStorage.setItem("theme", theme);
}, [theme]);


  return (
    <section>
      <h2 className="text-2xl font-semibold text-black mb-2">Display Settings</h2>
      <p className="text-sm text-gray-600 mb-6">Customize the appearance of the application.</p>

      <div className="space-y-4 max-w-2xl">
        <div className="p-4 rounded-md border bg-white flex items-center justify-between">
          <div>
            <div className="font-medium text-black">Appearance</div>
            <div className="text-sm text-gray-500">Toggle between light and dark mode.</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">Light</span>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
              className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-5" : "translate-x-1"}`} />
            </button>
            <span className="text-xs text-gray-500">Dark</span>
          </div>
        </div>

        <div className="p-4 rounded-md border bg-white">
          <div className="font-medium mb-2 text-black">Current theme</div>
          <div className="text-sm text-gray-700">
            {theme === "dark" ? "Dark mode is enabled" : "Light mode is enabled"}
          </div>
        </div>

        <div className="flex gap-3">
          <button
  className="px-4 py-2 bg-blue-600 text-white rounded-md"
  onClick={() => {
    localStorage.setItem("theme", theme);
    alert(`Saved — current theme: ${theme}`);
  }}
>
  Save changes
</button>

          <button
            className="px-4 py-2 bg-gray-100 rounded-md text-black"
            onClick={() => {
              setTheme("light");
              localStorage.removeItem("theme");
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}
