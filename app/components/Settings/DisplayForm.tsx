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
          (window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches)
        )
          return "dark";
      }
    } catch {
      // ignore
    }
    return "light";
  };

  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(
    getInitialTheme
  );

  useEffect(() => {
    async function fetchTheme() {
      try {
        const token = localStorage.getItem("token"); // jeśli token trzymasz w localStorage
        const res = await fetch("/api/users/theme", {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const data = await res.json();
        if (data.theme) {
          setTheme(data.theme);
          setSelectedTheme(data.theme);
          try {
            localStorage.setItem("theme", data.theme);
          } catch {}
        }
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

  useEffect(() => {
    // jeśli theme zmieni się z zewnątrz, zaktualizuj selectedTheme (anuluje lokalne zmiany)
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
        // dopiero teraz zastosuj motyw globalnie
        setTheme(data.theme);
        setSelectedTheme(data.theme);
        try {
          localStorage.setItem("theme", data.theme);
        } catch {}
        alert(`Zapisano motyw: ${data.theme}`);
      } else console.warn("PATCH response:", data);
    } catch (err) {
      console.error("Nie udało się zapisać motywu:", err);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-black mb-2 dark:text-gray-200">
        Display Settings
      </h2>

      <div className="p-4 rounded-md border bg-white flex items-center justify-between dark:border-gray-200 dark:bg-gray-700">
        <div>
          <div className="font-medium text-black dark:text-gray-200">
            Appearance
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-300">
            Toggle between light and dark mode.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-300">
            Light
          </span>
          <button
            onClick={() => setSelectedTheme(selectedTheme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-7 w-11 items-center rounded-full transition-colors ${
              selectedTheme === "dark" ? "bg-gray-800" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                selectedTheme === "dark" ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-300">Dark</span>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={saveTheme}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Save changes
        </button>

        <button
          className="px-4 py-2 bg-gray-100 rounded-md text-black"
          onClick={() => {
            // anuluj lokalny wybór i przywróć zapisaną wartość
            setSelectedTheme(theme);
          }}
        >
          Reset
        </button>
      </div>
    </section>
  );
}
