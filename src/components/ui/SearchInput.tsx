import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  onSubmit: (data: string) => void;
  onChange?: (data: string) => void;

  label?: string;
  placeholder?: string;
  button?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  placeholder,
  button,
  onSubmit,
  onChange,
}) => {

  const [search, setSearch] = useState("");

  return (
    <>
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
            setSearch(e.target.value);
            onChange?.(e.target.value);
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
    </>
  );
};

export default SearchInput;
