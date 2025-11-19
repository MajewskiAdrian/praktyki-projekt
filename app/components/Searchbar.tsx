interface SearchBarProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

export default function SearchBar({ searchText, setSearchText }: SearchBarProps) {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Search:
      </label>
      <input
        type="text"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search by title or description..."
        className="flex-1 px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400"
      />
      {searchText && (
        <button
          onClick={() => setSearchText("")}
          className="px-2 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  );
}