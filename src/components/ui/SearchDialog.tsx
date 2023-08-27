import { type ChangeEvent, Fragment, KeyboardEventHandler, useCallback, useEffect, useState } from "react"
import { Combobox, Dialog, Transition } from "@headlessui/react"
import { useRouter } from "next/router"
import Highlighter from "react-highlight-words"
import { SearchIcon } from "lucide-react"
import { cn } from "~/lib/utils"
import { useQuery } from "react-query"
import { useMapStore } from "~/lib/stores/mapStore"
import { MapObjectType } from "~/lib/map/MapObject"
import { type SearchableObject } from "~/lib/map/MapData"
import { PiMapPin } from "react-icons/pi"
import Image from "next/image"
import { MdPersonSearch } from "react-icons/md"
import { type StrapiResponse, searchEmployees } from "~/lib/employees/api"
import { FaRegFrownOpen } from "react-icons/fa"
import { X } from "lucide-react"
import { toast } from "react-hot-toast"

interface SearchDialogProps {
  open: boolean
  setOpen: (state: boolean) => void
}

function SearchHighlighter(props: { textToHighlight: string; query: string; isActiveOption: boolean }) {
  return (
    <Highlighter
      highlightClassName={cn(props.isActiveOption ? "bg-yellow-300" : "bg-yellow-200")}
      searchWords={props.query.split(" ")}
      autoEscape={true}
      textToHighlight={props.textToHighlight}
    />
  )
}

export default function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const [query, setQuery] = useState("")

  const { mapData, setSelectedFromSearchRoom } = useMapStore()

  const { data: employeeData, isLoading: employeeIsLoading } = useQuery<StrapiResponse>("searchEmployees", {
    queryFn: async () => {
      const employees = await searchEmployees(query)
      const employeesByPositions = []
      for (const employee of employees.data) {
        const positions = employee.attributes.positions

        for (const position of positions) {
          const copy = { ...employee }
          copy.attributes.positions = [position]
          employeesByPositions.push(copy)
        }
      }
      return { data: employeesByPositions }
    },
    enabled: query !== "" && query.length > 3,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const [results, setResults] = useState<Record<string, SearchableObject[]>[]>([])

  useEffect(() => {
    if (query.length < 2) return

    const searchResults = mapData?.searchObjectsByName(query, [MapObjectType.ROOM]) ?? []

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
  }, [query])

  const closeDialog = () => setOpen(false)

  const onSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)

  const onEmployeeClick = (employee: StrapiResponse["data"][0]) => {
    const employeeRooms = employee?.attributes?.positions
      .map((position) => position?.contacts.map((contact) => contact?.room?.data.attributes))
      .flat()

    if (employeeRooms.length == 1) {
      if (employeeRooms[0]?.name && employeeRooms[0]?.campus) {
        const room = { name: employeeRooms[0]?.name, campus: employeeRooms[0]?.campus, mapObject: null }
        setSelectedFromSearchRoom(room)
        closeDialog()
        return
      }
    }

    toast.error("Не удалось определить аудиторию сотрудника")
  }

  return (
    <>
      <Transition.Root show={open} as={Fragment} afterLeave={() => setQuery("")} appear>
        <Dialog as="div" className="relative z-30" open={open} onClose={() => setOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-30 overflow-y-auto p-2 sm:p-6 md:p-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all sm:h-auto sm:w-full sm:max-w-2xl h-full">
                <Combobox>
                  {({ open, activeOption }) => (
                    <>
                      <div className="relative">
                        <SearchIcon
                          className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <Combobox.Input
                          className="h-12 w-full border-0 bg-transparent pl-11 pr-12 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
                          placeholder="Поиск..."
                          onChange={onSearchInputChange}
                          autoFocus
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="sm:hidden absolute right-3 top-3.5 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            closeDialog()
                          }}
                        >
                          <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                      {query === "" && employeeData === undefined && (
                        <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
                          <MdPersonSearch className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                          <p className="mt-4 font-semibold text-gray-900">Поиск сотрудников или аудиторий</p>
                          <p className="mt-2 text-gray-500">Вы можете быстро перейти к нужному аудитории</p>
                        </div>
                      )}
                      {employeeData?.data && employeeData?.data.length > 0 && (
                        <Combobox.Options
                          static
                          className="sm:max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2 max-h-full"
                        >
                          <div className="px-4 py-2 text-sm font-medium text-gray-900">Сотрудники</div>
                          {employeeData?.data.map((employee) => (
                            <Combobox.Option
                              key={employee.id}
                              value={employee}
                              onClick={() => {
                                onEmployeeClick(employee)
                              }}
                              className={({ active }) =>
                                cn(
                                  "cursor-pointer p-4 hover:bg-gray-200",
                                  active && "bg-gray-200",
                                  employee === activeOption && "bg-gray-200",
                                )
                              }
                            >
                              {({ active }) => (
                                <div className="flex items-center space-x-3 w-full">
                                  {employee.attributes.photo && (
                                    <Image
                                      className="rounded-full object-cover mr-2 h-12 w-12 flex-shrink-0"
                                      src={employee.attributes.photo.data.attributes.url}
                                      width={48}
                                      height={48}
                                      alt={`${employee.attributes.firstName} ${employee.attributes.lastName}`}
                                    />
                                  )}
                                  <div className="flex flex-col flex-grow">
                                    <div className="text-md font-medium text-gray-900 flex flex-row">
                                      <SearchHighlighter
                                        textToHighlight={`${employee.attributes.lastName} ${
                                          employee.attributes.firstName
                                        }${employee.attributes.patronymic ? ` ${employee.attributes.patronymic}` : ""}`}
                                        query={query}
                                        isActiveOption={active}
                                      />
                                      {employee.attributes.positions.map((position) => (
                                        <>
                                          <div className="flex items-center ml-2">
                                            в <PiMapPin className="ml-2 h-4 w-4 text-gray-700" aria-hidden="true" />
                                            <p className="text-gray-700">
                                              {position?.contacts[0]?.room?.data.attributes.name ?? "Неизвестно"}
                                            </p>
                                          </div>
                                        </>
                                      ))}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      {employee.attributes.positions.map((position) => (
                                        <>
                                          <div key={`${employee.id}_${position.department}_${position.post}`}>
                                            {position.post}, {position.department}
                                          </div>
                                        </>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      )}
                      {results.length > 0 && (
                        <Combobox.Options
                          static
                          className="max-h-80 scroll-pb-2 scroll-pt-11 space-y-2 overflow-y-auto pb-2"
                        >
                          <div className="px-4 py-2 text-sm font-medium text-gray-900">Аудитории</div>

                          {results.map((object) =>
                            Object.entries(object).map(([floor, objects]) => (
                              <div key={floor}>
                                <h2 className="text-lg font-medium text-gray-700 p-4">{`Этаж ${floor}`}</h2>
                                {objects.map((obj: SearchableObject) => (
                                  <Combobox.Option
                                    key={obj.mapObject.id}
                                    value={obj.mapObject.name}
                                    className="cursor-pointer p-4 hover:bg-gray-200"
                                    onClick={() => {
                                      setSelectedFromSearchRoom({
                                        name: obj.mapObject.name,
                                        campus: "",
                                        mapObject: obj.mapObject,
                                      })
                                      closeDialog()
                                    }}
                                  >
                                    <p className="text-gray-800">{obj.mapObject.name}</p>
                                  </Combobox.Option>
                                ))}
                              </div>
                            )),
                          )}
                        </Combobox.Options>
                      )}

                      {query !== "" && employeeData && employeeData.data.length === 0 && results.length === 0 && (
                        <div className="border-t border-gray-100 px-6 py-14 text-center text-sm sm:px-14">
                          <FaRegFrownOpen className="mx-auto h-6 w-6 text-gray-400" aria-hidden="true" />
                          <p className="mt-4 font-semibold text-gray-900">Результатов не найдено</p>
                          <p className="mt-2 text-gray-500">Мы не смогли найти ничего по этому запросу.</p>
                        </div>
                      )}
                    </>
                  )}
                </Combobox>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  )
}
