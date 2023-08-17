import React from "react";
import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
  text?: string;
}

const SearchButton: React.FC<SearchButtonProps> = ({
  onClick,
  text: placeholder,
}) => {
  return (
    <button
      className="pointer-events-auto block w-full cursor-pointer rounded-lg border border-gray-300 bg-gray-100 p-2.5 pl-10 text-left text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      onClick={onClick}
    >
      <div className="flex items-center">
        <Search className="h-5 w-5 text-gray-400" />
        <span className="ml-2 leading-5 text-gray-500">
          {placeholder || "Поиск..."}
        </span>
      </div>
    </button>
  );
};

export default SearchButton;
