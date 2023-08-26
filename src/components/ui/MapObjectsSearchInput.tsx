import React, { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { type SearchableObject } from "~/lib/map/MapData"
import { Combobox } from "@headlessui/react"

interface MapObjectsSearchInputProps {
  onSubmit: (searchableObject: SearchableObject) => void
  onChange?: (data: string) => void

  label?: string
  placeholder?: string
  showSubmitButton: boolean
  submitButton?: string
  inputRef?: React.Ref<HTMLInputElement>

  searchResults: SearchableObject[]

  selected: SearchableObject | null

  initialSearch?: string
}

const MapObjectsSearchInput: React.FC<MapObjectsSearchInputProps> = ({
  label,
  placeholder,
  submitButton,
  showSubmitButton,
  onSubmit,
  onChange,
  selected,
  searchResults,
  inputRef,
  initialSearch,
}) => {
  const [search, setSearch] = useState(selected?.mapObject.name ?? "")
  const [results, setResults] = useState<Record<string, SearchableObject[]>[]>([])
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    if (searchResults) {
      const newRes = []
      const visitedFloors = new Set()
      for (const res of searchResults) {
        if (!visitedFloors.has(res.floor)) {
          const elementsForThisFloor = searchResults.filter((result) => result.floor === res.floor)
          visitedFloors.add(res.floor)
          newRes.push({ [res.floor]: elementsForThisFloor })
        }
      }

      if (newRes !== results) {
        setResults(newRes)
      }
    } else {
      setShowResults(false)
    }
  }, [search, searchResults])

  const handleSelect = (result: SearchableObject) => {
    setShowResults(false)
    setSearch(result.mapObject.name)
    onSubmit(result)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    onChange?.(value)
  }

  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch)
    }
  }, [initialSearch])

  return (
    <div className="pointer-events-auto relative">
      <label htmlFor="default-search" className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label ?? "Поиск"}
      </label>
      <Combobox value={search}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <Combobox.Input
            ref={inputRef}
            type="search"
            id="default-search"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-3 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            placeholder={placeholder ?? "Поиск"}
            autoComplete="off"
            required
            onChange={(event) => {
              setShowResults(true)
              void handleSearch(event.target.value)
            }}
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
        {results && results.length > 0 && showResults && search !== "" && (
          <Combobox.Options
            className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg"
            static
          >
            {results.map((result) =>
              Object.entries(result).map(([floor, objects]) => (
                <div key={floor}>
                  <h2 className="text-lg font-medium text-gray-700 p-4">{`Этаж ${floor}`}</h2>
                  {objects.map((obj: SearchableObject) => (
                    <Combobox.Option
                      key={obj.mapObject.id}
                      value={obj.mapObject.name}
                      className="cursor-pointer p-4 hover:bg-gray-200"
                      onClick={() => handleSelect(obj)}
                    >
                      <p className="text-gray-800">{obj.mapObject.name}</p>
                    </Combobox.Option>
                  ))}
                </div>
              )),
            )}
          </Combobox.Options>
        )}
      </Combobox>
    </div>
  )
}

export default MapObjectsSearchInput
