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
        <div className="tags">
          {tags.map((tag) => (
            <label
              key={tag.id}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                marginRight: 8,
              }}
            >
              <input
                type="checkbox"
                checked={selectedTags.includes(tag.id)}
                onChange={() => toggleTag(tag.id)}
              />
              <span>{tag.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
