import React, { type FormEvent, useRef, useEffect } from "react"
import { X } from "lucide-react"
import { Fragment, useState } from "react"
import { Dialog, Transition } from "@headlessui/react"
import MapObjectsSearchInput from "../MapObjectsSearchInput"
import { MapData, type SearchableObject } from "~/lib/map/MapData"
import { type MapObject, MapObjectType } from "~/lib/map/MapObject"
import { useMapStore } from "~/lib/stores/mapStore"

interface RoutesModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (mapObjectStart: MapObject, mapObjectEnd: MapObject) => void

  startMapObject?: MapObject | null
  endMapObject?: MapObject | null
}

const NavigationDialog: React.FC<RoutesModalProps> = ({ isOpen, onClose, onSubmit, startMapObject, endMapObject }) => {
  const { mapData } = useMapStore()
  const [start, setStart] = useState<SearchableObject | null>(null)
  const [startSearchResults, setStartSearchResults] = useState<SearchableObject[]>([])
  const [end, setEnd] = useState<SearchableObject | null>(null)
  const [endSearchResults, setEndSearchResults] = useState<SearchableObject[]>([])

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
    }
  }

  const cancelButtonRef = useRef(null)

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 overflow-y-auto"
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

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-900 ml-10">
                      Начальная точка
                    </label>
                    <div className="flex flex-row items-center">
                      <div className="text-center bg-blue-300 text-blue-700 font-bold rounded-full w-9 h-8 flex items-center justify-center mr-2">
                        А
                      </div>
                      <div className="w-full">
                        <MapObjectsSearchInput
                          onSubmit={(searchObject) => {
                            setStart(searchObject)
                          }}
                          showSubmitButton={false}
                          onChange={(name) => {
                            if (mapData) {
                              setStartSearchResults(mapData.searchObjectsByName(name, [MapObjectType.ROOM]))
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
                        className="mt-2 text-sm text-blue-700 font-medium text-left cursor-pointer hover:underline ml-10"
                        onClick={() => {
                          onClose()
                        }}
                      >
                        выбрать на карте
                      </p>
                    )}
                  </div>

                  <div className="w-full">
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 ml-10">
                      Конечная точка
                    </label>
                    <div className="flex flex-row items-center">
                      <div className="text-center bg-blue-300 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center mr-2">
                        Б
                      </div>
                      <div className="w-full">
                        <MapObjectsSearchInput
                          onSubmit={(searchObject) => {
                            setEnd(searchObject)
                          }}
                          selected={end}
                          showSubmitButton={false}
                          onChange={(name) => {
                            if (mapData) {
                              setEndSearchResults(mapData.searchObjectsByName(name, [MapObjectType.ROOM]))
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
                        className="mt-2 text-sm text-blue-700 font-medium text-left cursor-pointer hover:underline ml-10"
                        onClick={() => {
                          onClose()
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
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default NavigationDialog
