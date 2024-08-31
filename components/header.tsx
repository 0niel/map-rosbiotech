'use client'

import campuses from '@/lib/campuses'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import DisplayModeSettingsDialog from './DisplayModeSettingsDialog'
import { CommandMenu } from './command-menu'
import DropdownRadio from './dropdown-radio'
import { MapDisplayMode } from './svg-maps/MapDisplayMode'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'

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
  const { campus, building, setCampus, setBuilding } = useMapStore()
  const displayModeStore = useDisplayModeStore()

  const [displayModeSettingsDialogOpen, setDisplayModeSettingsDialogOpen] =
    useState(false)
  const [isFlutterWebView, setIsFlutterWebView] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor
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
                  {/* <Sidebar /> */}

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
                {campus.buildings && (
                  <div className="mr-4">
                    <DropdownRadio
                      title={building?.name || 'Выберите корпус'}
                      options={Array.from(campus.buildings, (building, i) => ({
                        label: building.name,
                        description: building.description ?? '',
                        id: i.toString()
                      }))}
                      onSelectionChange={selectedOption => {
                        if (!selectedOption) {
                          return
                        }
                        const newBuilding =
                          campus.buildings![parseInt(selectedOption.id)]
                        setBuilding(newBuilding || null)
                      }}
                      defaultSelectedOptionId={building ? building.name : ''}
                    />
                  </div>
                )}
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary">Бета</Badge>
                </TooltipTrigger>
                <TooltipContent className="w-80">
                  <p className="text-sm">
                    Карта и навигация находится в постоянной разработке. Мы
                    стараемся сделать её лучше.
                  </p>
                  <div className="text-left">
                    <Link href="https://t.me/pulse_rosbiotech/4">
                      <Button variant="link" className="p-0">
                        Сообщить об ошибке
                      </Button>
                    </Link>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </nav>
      </header>
    </>
  )
}
