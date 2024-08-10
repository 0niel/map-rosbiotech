'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import DisplayModeSettingsDialog from './DisplayModeSettingsDialog'
import SearchButton from './SearchButton'
import { CommandMenu } from './command-menu'
import DropdownRadio from './dropdown-radio'
import { Sidebar } from './sidebar'
import { MapDisplayMode } from './svg-maps/MapDisplayMode'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import campuses from '@/lib/campuses'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import { cn } from '@/lib/utils'
import { AppWindow, CalendarDays, Map, Menu, Search, Timer } from 'lucide-react'
import toast from 'react-hot-toast'
import { TbApps } from 'react-icons/tb'

const MapDisplayButton = ({
  mode,
  currentMode,
  handleClick,
  icon,
  text
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
        'group block rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600',
        mode === currentMode
          ? 'hover-bg-green-200 bg-green-100'
          : 'hover:bg-gray-100 dark:hover:bg-gray-600'
      )}
    >
      {icon}
      <div
        className={cn(
          'text-sm',
          mode === currentMode
            ? 'text-green-500'
            : 'text-gray-900 dark:text-white'
        )}
      >
        {text}
      </div>
    </button>
  )
}

export const Header = () => {
  const { campus, setCampus } = useMapStore()
  const displayModeStore = useDisplayModeStore()

  const [displayModeSettingsDialogOpen, setDisplayModeSettingsDialogOpen] =
    useState(false)
  const [isFlutterWebView, setIsFlutterWebView] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera
    if (userAgent.includes('FlutterWebView')) {
      setIsFlutterWebView(true)
    }
  }, [])

  const handleDisplayModeFeatureClick = (displaMode: MapDisplayMode) => {
    if (displayModeStore.mode === displaMode) {
      displayModeStore.setMode(MapDisplayMode.DEFAULT)
      return
    }

    displayModeStore.setMode(displaMode)
  }

  return (
    <>
      <header className="sticky top-0 z-10">
        <DisplayModeSettingsDialog
          isOpen={displayModeSettingsDialogOpen}
          onClose={function (): void {
            setDisplayModeSettingsDialogOpen(false)
            toast.success(
              'Время и дата отображения статусов аудиторий изменены'
            )
          }}
        />
        <nav
          className="select-none bg-white px-4 py-2.5 dark:bg-[#1c1c1e]
        lg:px-6"
        >
          <div className="flex items-center justify-between md:justify-start">
            {!isFlutterWebView && (
              <div className="flex items-center">
                <div className="flex items-center">
                  <Sidebar />

                  <div className="mr-4 flex">
                    <Image
                      src="logo-dark.svg"
                      className="mr-3 h-12 dark:hidden"
                      alt="РОСБИОТЕХ Герб"
                      width={210}
                      height={150}
                    />
                    <Image
                      src="logo-light.svg"
                      className="mr-3 hidden h-12 dark:block"
                      alt="РОСБИОТЕХ Герб"
                      width={210}
                      height={150}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="flex items-center md:w-full md:justify-between">
              <CommandMenu />
              <div className="ml-auto flex items-center">
                <div className="mr-4">
                  <DropdownRadio
                    title={campus.shortName}
                    options={Array.from(campuses, (campus, i) => ({
                      label: campus.shortName,
                      description: campus.description,
                      id: i.toString()
                    }))}
                    onSelectionChange={selectedOption => {
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

                {/* <!-- Apps -->  */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <TbApps className="h-6 w-6" aria-hidden="true" />
                      <span className="sr-only">
                        Дополнительные возможности
                      </span>
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuLabel>Дополнительно</DropdownMenuLabel>

                    <div className="grid grid-cols-3 gap-2">
                      <DropdownMenuItem>
                        <MapDisplayButton
                          mode={MapDisplayMode.HEATMAP}
                          currentMode={displayModeStore.mode}
                          handleClick={handleDisplayModeFeatureClick}
                          icon={
                            <Map
                              className={cn(
                                'mx-auto mb-1 h-7 w-7',
                                displayModeStore.mode == MapDisplayMode.HEATMAP
                                  ? 'text-green-500'
                                  : 'text-gray-400 group-hover:text-gray-500'
                              )}
                            />
                          }
                          text="нагрузка аудиторий"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MapDisplayButton
                          mode={MapDisplayMode.ROOMS_STATUSES}
                          currentMode={displayModeStore.mode}
                          handleClick={handleDisplayModeFeatureClick}
                          icon={
                            <CalendarDays
                              className={cn(
                                'mx-auto mb-1 h-7 w-7',
                                displayModeStore.mode ==
                                  MapDisplayMode.ROOMS_STATUSES
                                  ? 'text-green-500'
                                  : 'text-gray-400 group-hover:text-gray-500'
                              )}
                            />
                          }
                          text="свободные аудитории"
                        />
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <button
                          className="rounded-lg p-4 text-center hover:bg-gray-100 dark:hover:bg-gray-600"
                          onClick={() => setDisplayModeSettingsDialogOpen(true)}
                        >
                          <Timer className="mx-auto mb-1 h-7 w-7 text-gray-400 group-hover:text-gray-500" />
                          <div className="text-sm text-gray-900 dark:text-white">
                            дата и время
                          </div>
                        </button>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
