import { Search } from 'lucide-react'
import React from 'react'

interface SearchButtonProps {
  onClick: () => void
}

const SearchButton: React.FC<SearchButtonProps> = ({ onClick }) => {
  return (
    <div className="relative mt-1 lg:w-96">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
      </div>
      <button
        className="focus:ring-primary-500 focus:border-primary-500 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-gray-900 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        onClick={onClick}
      >
        <p className="text-start text-gray-500">Поиск</p>
      </button>
    </div>
  )
}

export default SearchButton
