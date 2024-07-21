import React, {
  type FormEvent,
  Fragment,
  useEffect,
  useRef,
  useState
} from 'react'
import MapObjectsSearchInput from '../map-objects-search-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { type SearchableObject } from '@/lib/map/MapData'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

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
  const [startSearchResults, setStartSearchResults] = useState<
    SearchableObject[]
  >([])
  const [end, setEnd] = useState<SearchableObject | null>(null)
  const [endSearchResults, setEndSearchResults] = useState<SearchableObject[]>(
    []
  )

  const startInputRef = useRef<HTMLInputElement>(null)
  const endInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && startInputRef.current) {
      startInputRef.current.focus()
    }
  }, [isOpen, startInputRef])

  useEffect(() => {
    if (isOpen && endInputRef.current) {
      endInputRef.current.focus()
    }
  }, [isOpen, endInputRef])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (start && end) {
      onSubmit(start.mapObject, end.mapObject)
    } else if (startMapObject && endMapObject) {
      onSubmit(startMapObject, endMapObject)
    } else {
      toast.error('Необходимо выбрать начальную и конечную точки')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Навигация</DialogTitle>
          <DialogDescription>
            Выберите начальную и конечную точки для маршрута.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="w-full">
            <Label htmlFor="start-point" className="mb-2 ml-10">
              Начальная точка
            </Label>
            <div className="flex flex-row items-center">
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-300 text-center font-bold text-blue-700">
                А
              </div>
              <div className="w-full">
                <MapObjectsSearchInput
                  onSubmit={searchObject => {
                    setStart(searchObject)
                    onSelect(searchObject.mapObject, null)
                  }}
                  showSubmitButton={false}
                  onChange={name => {
                    if (mapData) {
                      setStartSearchResults(
                        mapData.searchObjectsByName(name, [MapObjectType.ROOM])
                      )
                    }
                  }}
                  searchResults={startSearchResults}
                  selected={start}
                  inputRef={startInputRef}
                  initialSearch={startMapObject?.name}
                />
              </div>
            </div>
            {!startInputRef.current?.value && !startMapObject && (
              <Button
                variant={'link'}
                className="ml-8"
                onClick={() => {
                  setWaitForSelectStart()
                }}
              >
                выбрать на карте
              </Button>
            )}
          </div>

          <div className="w-full">
            <Label htmlFor="end-point" className="mb-2 ml-10">
              Конечная точка
            </Label>
            <div className="flex flex-row items-center">
              <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-300 text-center font-bold text-blue-700">
                Б
              </div>
              <div className="w-full">
                <MapObjectsSearchInput
                  onSubmit={searchObject => {
                    setEnd(searchObject)
                    onSelect(null, searchObject.mapObject)
                  }}
                  selected={end}
                  showSubmitButton={false}
                  onChange={name => {
                    if (mapData) {
                      setEndSearchResults(
                        mapData.searchObjectsByName(name, [MapObjectType.ROOM])
                      )
                    }
                  }}
                  searchResults={endSearchResults}
                  inputRef={endInputRef}
                  initialSearch={endMapObject?.name}
                />
              </div>
            </div>
            {!endInputRef.current?.value && !endMapObject && (
              <Button
                variant={'link'}
                className="ml-8"
                onClick={() => {
                  setWaitForSelectEnd()
                }}
              >
                выбрать на карте
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Построить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NavigationDialog
