import React from 'react'
import Image from 'next/image'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import RoomInfoTabContent from './RoomInfoTabContent'
import ScheduleCalendar from './ScheduleCalendar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import config from '@/lib/config'
import { MapObject, MapObjectType } from '@/lib/map/MapObject'
import { RoomOnMap } from '@/lib/map/RoomOnMap'
import {
  DataSourceConfig,
  createDataSource
} from '@/lib/schedule/data-source-factory'
import { Classroom } from '@/lib/schedule/models/classroom'
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part'
import { getAcademicWeek } from '@/lib/schedule/utils'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import axios from 'axios'
import { QrCodeIcon, Link } from 'lucide-react'
import CopyToClipboard from 'react-copy-to-clipboard'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'

import { RiRouteLine } from 'react-icons/ri'
import QRCode from 'qrcode.react'

interface RoomDrawerProps {
  isOpen: boolean
  onClose: () => void
  room: RoomOnMap

  onClickNavigateFromHere: (mapObject: MapObject) => void
  onClickNavigateToHere: (mapObject: MapObject) => void

  findNearestObject: (
    mapObjectType: MapObjectType,
    mapObjectNames: string[]
  ) => void
}

const getCurrentEvent = (lessons: LessonSchedulePart[], dateTime: Date) => {
  const academicWeek = getAcademicWeek(dateTime)
  const currentDay = dateTime.getDay()
  const currentTime = dateTime.getHours() * 60 + dateTime.getMinutes()

  // return lessons.find(
  //   lesson =>
  //     lesson.academicWeek === academicWeek &&
  //     lesson.dayOfWeek === currentDay &&
  //     lesson.lessonBells.some(
  //       bell => currentTime >= bell.startTime && currentTime <= bell.endTime
  //     )
  // )
  return null as LessonSchedulePart | null
}

const FastNavigateButton: React.FC<{ onClick: () => void; title: string }> = ({
  onClick,
  title
}) => {
  return (
    <Badge
      className="w-full cursor-pointer px-2 py-1.5 sm:w-auto sm:whitespace-nowrap"
      onClick={onClick}
      variant={'secondary'}
    >
      {title}
    </Badge>
  )
}

const generateLink = (mapObjectId: string) => {
  return `${window.location.origin}/?object=${mapObjectId}`
}

const RoomDrawer: React.FC<RoomDrawerProps> = ({
  isOpen,
  onClose,
  room,
  onClickNavigateFromHere,
  onClickNavigateToHere,
  findNearestObject
}) => {
  const { timeToDisplay } = useDisplayModeStore()
  const { campus } = useMapStore()

  const { isLoading, isError, data, isFetched } = useQuery(
    ['room', timeToDisplay, room.mapObject],
    {
      queryFn: async () => {
        if (!room) {
          return
        }

        const res = await axios.get<LessonSchedulePart[]>('/api/schedule')
        const lessons = res.data

        return {
          lessons,
          status: 'free',
          info: {
            workload: 0,
            purpose: ''
          }
        }
      }
    }
  )

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetTitle>
          <div className="flex flex-row items-center">
            <h5
              id="drawer-right-label"
              className="inline-flex items-center text-base font-bold text-gray-900 dark:text-gray-400"
            >
              Аудитория {room.mapObject.name}
            </h5>
            <SheetDescription>
              <div className="ml-4 flex flex-row items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <QrCodeIcon className="h-5 w-5" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent>
                    <DropdownMenuItem className="pointer-events-none">
                      <div className="flex flex-col items-center">
                        <QRCode
                          value={generateLink(room.mapObject.id)}
                          size={256}
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                          includeMargin={false}
                          renderAs="svg"
                        />

                        <p className="mt-2 text-sm text-gray-900">
                          Этот QR-код можно отсканировать, чтобы открыть эту
                          аудиторию на карте
                        </p>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <CopyToClipboard
                  text={generateLink(room.mapObject.id)}
                  onCopy={() => {
                    toast.success('Ссылка скопирована в буфер обмена')
                  }}
                >
                  <button
                    type="button"
                    className="rounded-lg bg-gray-100 p-1.5 text-sm text-gray-900 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    <Link className="h-5 w-5" />
                  </button>
                </CopyToClipboard>
              </div>
            </SheetDescription>
          </div>
        </SheetTitle>

        <div className="mt-4 flex flex-col">
          <Tabs defaultValue="info">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="w-full">
                Информация
              </TabsTrigger>
              <TabsTrigger value="schedule" className="w-full">
                Расписание
              </TabsTrigger>
            </TabsList>
            <TabsContent value="info">
              <div className="mb-4 flex flex-col p-2">
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                  Найти ближайшие
                </p>
                <div className="flex w-full flex-row flex-nowrap space-x-2 overflow-x-auto sm:flex sm:flex-wrap sm:gap-2 sm:space-x-1 sm:space-y-0">
                  <FastNavigateButton
                    onClick={() =>
                      findNearestObject(MapObjectType.TOILET, [
                        'Туалет М',
                        'Туалет МЖ'
                      ])
                    }
                    title="Туалет М"
                  />
                  <FastNavigateButton
                    onClick={() =>
                      findNearestObject(MapObjectType.TOILET, [
                        'Туалет Ж',
                        'Туалет МЖ'
                      ])
                    }
                    title="Туалет Ж"
                  />
                  <FastNavigateButton
                    onClick={() => findNearestObject(MapObjectType.CANTEEN, [])}
                    title="Буфет"
                  />
                </div>
              </div>
              <div className="mb-4 flex flex-col p-2">
                <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                  Построить маршрут
                </p>
                <div className="mb-4 flex justify-between space-x-2">
                  <Button
                    className="w-full"
                    variant={'secondary'}
                    onClick={() => {
                      onClickNavigateFromHere(room.mapObject)
                    }}
                  >
                    <RiRouteLine className="mr-2 h-5 w-5" />
                    Отсюда
                  </Button>
                  <Button
                    className="w-full"
                    variant={'secondary'}
                    onClick={() => {
                      onClickNavigateToHere(room.mapObject)
                    }}
                  >
                    <RiRouteLine className="mr-2 h-5 w-5 rotate-180 transform" />
                    Сюда
                  </Button>
                </div>
              </div>
              {isLoading && (
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[20px] w-[100px] rounded" />
                  <Skeleton className="h-[20px] w-[80px] rounded" />
                  <Skeleton className="h-[20px] w-[80px] rounded" />
                  <Skeleton className="h-[20px] w-[150px] rounded" />
                  <Skeleton className="h-[20px] w-[120px] rounded" />
                </div>
              )}
              {isError && (
                <div className="flex h-full items-center justify-center">
                  <p>Ошибка загрузки данных</p>
                </div>
              )}
              {isFetched && !data && (
                <div className="flex h-full flex-col items-center justify-center">
                  <Image
                    src="assets/ghost.svg"
                    width={200}
                    height={200}
                    alt={''}
                  />
                  <p className="text-center text-gray-500">
                    Нет данных по этой аудитории
                  </p>
                </div>
              )}

              {!isLoading && data && (
                <RoomInfoTabContent
                  workload={data?.info?.workload || 0}
                  status={data?.status === 'free' ? 'Свободна' : 'Занята'}
                  purpose={data?.info?.purpose || ''}
                  eventName={
                    getCurrentEvent(data?.lessons || [], timeToDisplay)
                      ?.subject || ''
                  }
                  teachers={
                    getCurrentEvent(data?.lessons || [], timeToDisplay)
                      ?.teachers || []
                  }
                />
              )}
            </TabsContent>
            <TabsContent value="schedule">
              {isLoading && (
                <div className="flex flex-col space-y-3">
                  <Skeleton className="h-[20px] w-[100px] rounded" />
                  <Skeleton className="h-[20px] w-[80px] rounded" />
                  <Skeleton className="h-[20px] w-[80px] rounded" />
                  <Skeleton className="h-[20px] w-[150px] rounded" />
                  <Skeleton className="h-[20px] w-[120px] rounded" />
                </div>
              )}
              {!isLoading && (
                <ScheduleCalendar
                  date={timeToDisplay}
                  lessons={data?.lessons || []}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RoomDrawer
