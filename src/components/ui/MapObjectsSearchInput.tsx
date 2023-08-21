import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { type SearchableObject } from "~/lib/graph"

interface MapObjectsSearchInputProps {
  onSubmit: (searchableObject: SearchableObject) => void
  onChange?: (data: string) => void

  label?: string
  placeholder?: string
  showSubmitButton: boolean
  submitButton?: string

  searchResults: SearchableObject[]

  selected: SearchableObject | null
  setSelected?: (result: SearchableObject) => void
}

const MapObjectsSearchInput: React.FC<MapObjectsSearchInputProps> = ({
  label,
  placeholder,
  submitButton,
  showSubmitButton,
  onSubmit,
  onChange,
  selected,
  setSelected,
  searchResults,
}) => {
  const [search, setSearch] = useState(selected?.mapObject.name ?? "")
  const [results, setResults] = useState<Record<string, SearchableObject[]>>({})
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (searchResults) {
      const groupedResults = searchResults.reduce(
        (acc, result) => {
          if (!acc[result.floor]) {
            acc[result.floor] = []
          }
          acc[result.floor]?.push(result)
          return acc
        },
        {} as Record<string, SearchableObject[]>,
      )
      setResults(groupedResults)
      setShowResults(true)
    } else {
      setShowResults(false)
    }
  }, [searchResults])

  const handleSelect = (result: SearchableObject) => {
    setSearch(result.mapObject.name)
    setShowResults(false)
    onSubmit(result)
    setSelected?.(result)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    onChange?.(value)
  }

  return (
    <div className="pointer-events-auto relative">
      <label htmlFor="default-search" className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white">
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
          value={search}
          onChange={(e) => {
            void handleSearch(e.target.value)
          }}
          autoComplete="off"
          required
        />
        {showSubmitButton && (
          <button
            type="submit"
            className="absolute bottom-2.5 right-2.5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            onClick={(e) => {
              e.preventDefault()
            }}
          >
            {submitButton ?? "Найти"}
          </button>
        )}
      </div>
      {showResults && Object.keys(results).length > 0 && (
        <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {Object.entries(results).map(([floor, objects]) => (
            <div key={floor}>
              <h2 className="text-lg font-medium text-gray-700 dark:text-gray-200 p-4">{`Этаж ${floor}`}</h2>
              {objects.map((result) => (
                <div
                  key={result.mapObject.id}
                  className="cursor-pointer p-4 hover:bg-gray-200"
                  onClick={() => handleSelect(result)}
                >
                  <p className="text-sm text-gray-900">{result.mapObject.name}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MapObjectsSearchInput
