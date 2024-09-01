'use client'

import campuses from '@/lib/campuses'
import { useMapStore } from '@/lib/stores/mapStore'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CommandMenu } from './command-menu'
import DropdownRadio from './dropdown-radio'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

export const Header = () => {
  const { campus, building, setCampus, setBuilding } = useMapStore()
  const [isFlutterWebView, setIsFlutterWebView] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor
    if (userAgent.includes('FlutterWebView')) {
      setIsFlutterWebView(true)
    }
  }, [])

  return (
    <>
      <header className="sticky top-0 z-10">
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

            <Popover>
              <PopoverTrigger>
                <Badge variant="secondary">Бета</Badge>
              </PopoverTrigger>
              <PopoverContent className="w-80 rounded-md border">
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
              </PopoverContent>
            </Popover>
          </div>
        </nav>
      </header>
    </>
  )
}
