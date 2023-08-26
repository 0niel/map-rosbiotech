import Image from "next/image"
import DropdownRadio from "./DropdownRadio"
import { Dropdown } from "flowbite-react"
import { HiSearch, HiMap } from "react-icons/hi"
import SearchButton from "./SearchButton"
import { FaRegCalendarAlt } from "react-icons/fa"
import { BiTimeFive } from "react-icons/bi"
import campuses from "~/lib/campuses"
import { useMapStore } from "~/lib/stores/mapStore"
import { useState } from "react"
import DisplayModeSettingsDialog from "./DisplayModeSettingsDialog"
import { MapDisplayMode } from "../svg-maps/MapDisplayMode"
import { useDisplayModeStore } from "~/lib/stores/displayModeStore"
import { cn } from "~/lib/utils"

const MapDisplayButton = ({
  mode,
  currentMode,
  handleClick,
  icon,
  text,
}: {
  mode: MapDisplayMode
  currentMode: MapDisplayMode
  text: string
  icon: React.ReactNode
  handleClick: (mode: MapDisplayMode) => void
}) => {
  return (
    <button
      onClick={() => {
        handleClick(mode)
      }}
      className={cn(
        "group block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600",
        mode === currentMode ? "bg-green-100 hover-bg-green-200" : "hover:bg-gray-100 dark:hover:bg-gray-600",
      )}
    >
      {icon}
      <div className={cn("text-sm", mode === currentMode ? "text-green-500" : "text-gray-900 dark:text-white")}>
        {text}
      </div>
    </button>
  )
}

const HeaderNavbar = () => {
  const { campus, setCampus } = useMapStore()
  const displayModeStore = useDisplayModeStore()

  const [displayModeSettingsDialogOpen, setDisplayModeSettingsDialogOpen] = useState(false)

  const handleDisplayModeFeatureClick = (displaMode: MapDisplayMode) => {
    if (displayModeStore.mode === displaMode) {
      displayModeStore.setMode(MapDisplayMode.DEFAULT)
      return
    }

    displayModeStore.setMode(displaMode)
  }

  return (
    <header className="sticky top-0 z-50">
      <DisplayModeSettingsDialog
        isOpen={displayModeSettingsDialogOpen}
        onClose={function (): void {
          setDisplayModeSettingsDialogOpen(false)
        }}
      />
      <nav className="border-gray-200 bg-white px-4 py-2.5 dark:bg-gray-800 lg:px-6 select-none">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center justify-start">
            {/* <button
                id="toggleSidebar"
                aria-expanded="true"
                aria-controls="sidebar"
                className="mr-3 hidden cursor-pointer rounded p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:inline"
              >
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button> */}
            {/* <button
                aria-expanded="true"
                aria-controls="sidebar"
                className="mr-2 cursor-pointer rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:ring-2 focus:ring-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:bg-gray-700 dark:focus:ring-gray-700 lg:hidden"
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <svg
                  aria-hidden="true"
                  className="hidden h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Toggle sidebar</span>
              </button> */}
            <div className="mr-4 flex">
              <Image src="mirea-gerb.svg" className="mr-3 h-8" alt="РТУ МИРЭА Герб" width={32} height={32} />
              <span className="hidden self-center whitespace-nowrap text-2xl font-semibold sm:block">РТУ МИРЭА</span>
            </div>
            <div className="hidden lg:block lg:pl-2">
              <SearchButton
                onClick={function (): void {
                  throw new Error("Function not implemented.")
                }}
              />
            </div>
          </div>
          <div className="flex items-center lg:order-2">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white lg:hidden"
            >
              <span className="sr-only">Поиск</span>
              <HiSearch className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* <!-- Apps -->  */}
            <Dropdown
              label=""
              renderTrigger={(_) => (
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-4 focus:ring-gray-300"
                >
                  <span className="sr-only">Дополнительные возможности</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                  </svg>
                </button>
              )}
            >
              <div className="my-4 max-w-sm list-none divide-y divide-gray-100 overflow-hidden rounded text-base">
                <div className="block px-4 py-2 text-center text-base font-medium text-gray-700  ">Дополнительно</div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  <MapDisplayButton
                    mode={MapDisplayMode.HEATMAP}
                    currentMode={displayModeStore.mode}
                    handleClick={handleDisplayModeFeatureClick}
                    icon={
                      <HiMap
                        className={cn(
                          "mx-auto mb-1 h-7 w-7",
                          displayModeStore.mode === MapDisplayMode.HEATMAP
                            ? "text-green-500"
                            : "text-gray-400 group-hover:text-gray-500",
                        )}
                      />
                    }
                    text="тепловая карта"
                  />
                  <MapDisplayButton
                    mode={MapDisplayMode.ROOMS_STATUSES}
                    currentMode={displayModeStore.mode}
                    handleClick={handleDisplayModeFeatureClick}
                    icon={
                      <FaRegCalendarAlt
                        className={cn(
                          "mx-auto mb-1 h-7 w-7",
                          displayModeStore.mode === MapDisplayMode.ROOMS_STATUSES
                            ? "text-green-500"
                            : "text-gray-400 group-hover:text-gray-500",
                        )}
                      />
                    }
                    text="свободные аудитории"
                  />

                  <button
                    className="group block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600"
                    onClick={() => {
                      setDisplayModeSettingsDialogOpen(true)
                    }}
                  >
                    <BiTimeFive className="mx-auto mb-1 h-7 w-7 text-gray-400 group-hover:text-gray-500 " />
                    <div className="text-sm text-gray-900 dark:text-white">дата и время</div>
                  </button>
                </div>
              </div>
            </Dropdown>

            <div className="ml-2">
              <DropdownRadio
                title={campus.shortName}
                options={Array.from(campuses, (campus, i) => ({
                  label: campus.shortName,
                  description: campus.description,
                  id: i.toString(),
                }))}
                onSelectionChange={(selectedOption) => {
                  if (!selectedOption) {
                    return
                  }
                  const newCampus = campuses[parseInt(selectedOption.id)]
                  if (newCampus && newCampus !== campus) {
                    setCampus(newCampus)
                  }
                }}
                defaultSelectedOptionId="0"
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default HeaderNavbar
