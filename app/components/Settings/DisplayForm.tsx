"use client";
import React, { useState, useEffect } from "react";

export default function DisplayPanel() {
  const getInitialTheme = (): "light" | "dark" => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark" || saved === "light") return saved;
      if (typeof document !== "undefined") {
        if (document.documentElement.classList.contains("dark")) return "dark";
        if (
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
        )
          return "dark";
      }
    } catch { }
    return "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(
    getInitialTheme
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    async function fetchTheme() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users/theme", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.theme) {
          const localTheme = localStorage.getItem("theme");
          if (localTheme !== data.theme) {
            setTheme(data.theme);
            setSelectedTheme(data.theme);
            try {
              localStorage.setItem("theme", data.theme);
            } catch { }
          }
        }
      } catch (err) {
        console.error("Failed to fetch theme:", err);
      }
    }
    fetchTheme();
  }, []);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  const saveTheme = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/users/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ theme: selectedTheme }),
      });
      const data = await res.json();
      if (data.success) {
        setTheme(data.theme);
        setSelectedTheme(data.theme);
        try {
          localStorage.setItem("theme", data.theme);
        } catch { }
        
      } else console.warn("PATCH response:", data);
    } catch (err) {
      console.error("Failed to save theme:", err);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Display</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Customize the appearance of the application
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Theme
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Switch between light and dark mode
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Light
              </span>
              <button
                onClick={() =>
                  setSelectedTheme(selectedTheme === "dark" ? "light" : "dark")
                }
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${selectedTheme === "dark"
                    ? "bg-amber-600"
                    : "bg-gray-300"
                  }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-lg ${selectedTheme === "dark" ? "translate-x-7" : "translate-x-1"
                    }`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Dark
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={saveTheme}
          className="px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 font-medium"
        >
          Save changes
        </button>
      </div>
    </section>
  );
}
