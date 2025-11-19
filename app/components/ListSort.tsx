interface ListSortProps {
  sortBy: "date" | "title";
  setSortBy: (sort: "date" | "title") => void;
}

export default function ListSort({ sortBy, setSortBy }: ListSortProps) {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Sort by:
      </label>
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as "date" | "title")}
        className="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
      >
        <option value="date">Date</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
}