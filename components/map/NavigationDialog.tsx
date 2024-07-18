import React, { type FormEvent, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import MapObjectsSearchInput from '../MapObjectsSearchInput'
import { MapData, type SearchableObject } from '@/lib/map/MapData'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
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

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed z-50"
        initialFocus={cancelButtonRef}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-40 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative overflow-hidden rounded-lg bg-white p-2 shadow-xl sm:mx-auto sm:max-w-3xl sm:p-4 md:p-6">
              <button
                type="button"
                className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
                onClick={onClose}
              >
                <X size={20} />
                <span className="sr-only">Закрыть окно</span>
              </button>
              <div className="space-y-6 py-6">
                <div className="w-full">
                  <label className="mb-2 ml-10 block text-sm font-medium text-gray-900">
                    Начальная точка
                  </label>
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
                              mapData.searchObjectsByName(name, [
                                MapObjectType.ROOM
                              ])
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
                    <p
                      className="ml-10 mt-2 cursor-pointer text-left text-sm font-medium text-blue-700 hover:underline"
                      onClick={() => {
                        setWaitForSelectStart()
                      }}
                    >
                      выбрать на карте
                    </p>
                  )}
                </div>

                <div className="w-full">
                  <label className="mb-2 ml-10 block text-sm font-medium text-gray-900">
                    Конечная точка
                  </label>
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
                              mapData.searchObjectsByName(name, [
                                MapObjectType.ROOM
                              ])
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
                    <p
                      className="ml-10 mt-2 cursor-pointer text-left text-sm font-medium text-blue-700 hover:underline"
                      onClick={() => {
                        setWaitForSelectEnd()
                      }}
                    >
                      выбрать на карте
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  onClick={handleSubmit}
                >
                  Построить
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default NavigationDialog
