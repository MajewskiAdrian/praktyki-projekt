interface ListFilterProps {
  availableTags: string[];
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
}

export default function ListFilter({ availableTags, selectedTags, setSelectedTags }: ListFilterProps) {
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAll = () => setSelectedTags([]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by tags:
        </label>
        {selectedTags.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs px-2 py-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-sm px-3 py-1 rounded transition-all ${
              selectedTags.includes(tag)
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}