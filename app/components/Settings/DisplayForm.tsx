"use client";
import React, { useState, useEffect } from "react";

export default function DisplayPanel() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    async function fetchTheme() {
      try {
        const token = localStorage.getItem("token"); // jeśli token trzymasz w localStorage
        const res = await fetch("/api/users/theme", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.theme) setTheme(data.theme);
      } catch (err) {
        console.error("Nie udało się pobrać motywu:", err);
      }
    }
    fetchTheme();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
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
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (data.success) alert(`Zapisano motyw: ${data.theme}`);
      else console.warn("PATCH response:", data);
    } catch (err) {
      console.error("Nie udało się zapisać motywu:", err);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-black mb-2 dark:text-gray-200">Display Settings</h2>

      <div className="p-4 rounded-md border bg-white flex items-center justify-between dark:border-gray-200 dark:bg-gray-700">
        <div>
          <div className="font-medium text-black dark:text-gray-200">Appearance</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">Toggle between light and dark mode.</div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-300">Light</span>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors ${
              theme === "dark" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                theme === "dark" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-300">Dark</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button onClick={saveTheme} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          Save changes
        </button>

        <button
          className="px-4 py-2 bg-gray-100 rounded-md text-black"
          onClick={() => {
    setTheme("light");
    saveTheme(); // zapisuje w bazie
  }}
>
  Reset
        </button>
      </div>
    </section>
  );
}
