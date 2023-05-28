import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

export interface SearchResult {
  id: string;
  title: string;
}

interface SearchInputProps {
  onSubmit: (data: string) => void;
  onChange?: (data: string) => void;
  onSearchResultSelected?: (result: SearchResult) => void;

  label?: string;
  placeholder?: string;
  button?: string;

  searchResults: SearchResult[];
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder,
  button,
  onSubmit,
  onChange,
  onSearchResultSelected,
  searchResults,
}) => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchResults) {
      setResults(searchResults);
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchResults]);

  const handleSelect = (result: SearchResult) => {
    setSearch(result.title);
    setShowResults(false);
    onSubmit(result.id);
    onSearchResultSelected?.(result);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    onChange?.(value);
  };

  return (
    <div className="relative">
      <label
        htmlFor="default-search"
        className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        {label ?? "Поиск"}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          placeholder={placeholder ?? "Поиск"}
          onChange={(e) => {
            void handleSearch(e.target.value);
          }}
          required
        />
        <button
          type="submit"
          className="absolute bottom-2.5 right-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
          onClick={(e) => {
            e.preventDefault();
            onSubmit(search);
          }}
        >
          {button ?? "Найти"}
        </button>
      </div>
      {showResults && results.length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {results.map((result) => (
            <div
              key={result.id}
              className="cursor-pointer p-4 hover:bg-gray-200"
              onClick={() => handleSelect(result)}
            >
              <p className="text-sm text-gray-900">{result.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
