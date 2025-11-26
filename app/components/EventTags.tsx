"use client";

import React, { useEffect, useState } from "react";

type Tag = { id: number; name: string };

export default function EventTags({
  selectedTags,
  onChange,
}: {
  selectedTags: number[];
  onChange: (newTags: number[]) => void;
}) {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadTags() {
      try {
        const res = await fetch(`/api/tags`, { method: "GET" });
        if (!res.ok) throw new Error(`Failed to fetch tags: ${res.status}`);

        const data = await res.json();

        if (mounted) setTags(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error fetching tags:", err);
        if (mounted) setError("Failed to load tags");
      }
    }

    loadTags();

    return () => {
      mounted = false;
    };
  }, []);

  function toggleTag(id: number) {
    if (selectedTags.includes(id)) {
      onChange(selectedTags.filter((tagId) => tagId !== id));
    } else {
      onChange([...selectedTags, id]);
    }
  }

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : tags === null ? (
        <p>Loading...</p>
      ) : tags.length === 0 ? (
        <p>No tags available.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                aria-pressed={isSelected}
                className={`text-sm px-3 py-1 rounded transition-all ${
                  isSelected
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
