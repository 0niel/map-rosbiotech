import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { type SearchableObject } from '@/lib/map/MapData'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import React, { type FormEvent, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import MapObjectsSearchInput from '../map-objects-search-input'

interface RoutesModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (mapObjectStart: MapObject, mapObjectEnd: MapObject) => void
  onSelect: (
    mapObjectStart?: MapObject | null,
    mapObjectEnd?: MapObject | null
  ) => void
  startMapObject?: MapObject | null
  endMapObject?: MapObject | null
  setWaitForSelectStart: () => void
  setWaitForSelectEnd: () => void
}

const NavigationDialog: React.FC<RoutesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  startMapObject,
  endMapObject,
  onSelect,
  setWaitForSelectStart,
  setWaitForSelectEnd
}) => {
  const { mapData } = useMapStore()
  const [start, setStart] = useState<SearchableObject | null>(null)
  const [end, setEnd] = useState<SearchableObject | null>(null)
  const [startSearchResults, setStartSearchResults] = useState<
    SearchableObject[]
  >([])
  const [endSearchResults, setEndSearchResults] = useState<SearchableObject[]>(
    []
  )

  const startInputRef = useRef<HTMLInputElement>(null)
  const endInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      startInputRef.current?.focus()
    }
  }, [isOpen])

  const handleStartSearchChange = (name: string) => {
    if (mapData) {
      setStartSearchResults(
        mapData.searchObjectsByName(name, [MapObjectType.ROOM])
      )
    }
  }

  const handleEndSearchChange = (name: string) => {
    if (mapData) {
      setEndSearchResults(
        mapData.searchObjectsByName(name, [MapObjectType.ROOM])
      )
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const selectedStart = start?.mapObject || startMapObject
    const selectedEnd = end?.mapObject || endMapObject

    if (selectedStart && selectedEnd) {
      onSubmit(selectedStart, selectedEnd)
    } else {
      toast.error('Необходимо выбрать начальную и конечную точки')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[calc(100vh-env(safe-area-inset-bottom))] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Навигация</DialogTitle>
          <DialogDescription>
            Выберите начальную и конечную точки для маршрута.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <SearchPointSection
            label="Начальная точка"
            pointLetter="А"
            searchValue={start}
            searchResults={startSearchResults}
            onSearchChange={handleStartSearchChange}
            onSelect={searchObject => {
              setStart(searchObject)
              onSelect(searchObject.mapObject, null)
            }}
            inputRef={startInputRef}
            initialSearch={startMapObject?.name}
            onSelectFromMap={setWaitForSelectStart}
            showSelectButton={!startInputRef.current?.value && !startMapObject}
          />

          <SearchPointSection
            label="Конечная точка"
            pointLetter="Б"
            searchValue={end}
            searchResults={endSearchResults}
            onSearchChange={handleEndSearchChange}
            onSelect={searchObject => {
              setEnd(searchObject)
              onSelect(null, searchObject.mapObject)
            }}
            inputRef={endInputRef}
            initialSearch={endMapObject?.name}
            onSelectFromMap={setWaitForSelectEnd}
            showSelectButton={!endInputRef.current?.value && !endMapObject}
          />

          <DialogFooter>
            <Button type="submit">Построить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface SearchPointSectionProps {
  label: string
  pointLetter: string
  searchValue: SearchableObject | null
  searchResults: SearchableObject[]
  onSearchChange: (name: string) => void
  onSelect: (searchObject: SearchableObject) => void
  inputRef: React.RefObject<HTMLInputElement>
  initialSearch?: string
  onSelectFromMap: () => void
  showSelectButton: boolean
}

const SearchPointSection: React.FC<SearchPointSectionProps> = ({
  label,
  pointLetter,
  searchValue,
  searchResults,
  onSearchChange,
  onSelect,
  inputRef,
  initialSearch,
  onSelectFromMap,
  showSelectButton
}) => (
  <div className="w-full">
    <Label
      htmlFor={`${label.toLowerCase().replace(' ', '-')}-point`}
      className="mb-2 ml-10"
    >
      {label}
    </Label>
    <div className="flex flex-row items-center">
      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/40 text-center font-bold text-primary">
        {pointLetter}
      </div>
      <div className="w-full">
        <MapObjectsSearchInput
          onSubmit={onSelect}
          selected={searchValue}
          showSubmitButton={false}
          onChange={onSearchChange}
          searchResults={searchResults}
          inputRef={inputRef}
          initialSearch={initialSearch}
        />
      </div>
    </div>
    {showSelectButton && (
      <Button variant="link" className="ml-8" onClick={onSelectFromMap}>
        выбрать на карте
      </Button>
    )}
  </div>
)

export default NavigationDialog
