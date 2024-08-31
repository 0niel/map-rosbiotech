import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapObject, MapObjectType } from '@/lib/map/MapObject'
import { RoomOnMap } from '@/lib/map/RoomOnMap'
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part'
import { useMapStore } from '@/lib/stores/mapStore'
import axios from 'axios'
import { Link, QrCodeIcon } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import { useQuery } from 'react-query'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import RoomInfoTabContent from './room-info-tab-content'

import QRCode from 'qrcode.react'
import { RiRouteLine } from 'react-icons/ri'
import { toast } from 'sonner'
import ScheduleCalendar from './schedule-calendar'

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
  const { campus } = useMapStore()
  const [timeToDisplay, setTimeToDisplay] = useState(new Date())
  const [selectedWeek, setSelectedWeek] = useState<{ start: Date; end: Date }>()

  const fetchLessonsForWeek = async (startDate: Date, endDate: Date) => {
    const response = await axios.get<LessonSchedulePart[]>(
      `/api/schedule?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&room=${
        room.mapObject.name
      }&campus=${campus.shortName}`
    )

    return response.data
  }

  const {
    data: lessons,
    isLoading,
    isError,
    refetch
  } = useQuery(
    ['lessons', timeToDisplay, room.mapObject.name, campus.shortName],
    () =>
      fetchLessonsForWeek(
        new Date(timeToDisplay),
        new Date(
          new Date(timeToDisplay).setDate(new Date(timeToDisplay).getDate() + 6)
        )
      ),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 2
    }
  )

  useEffect(() => {
    refetch()
  }, [timeToDisplay, refetch])

  const handleWeekChange = (startDate: Date, endDate: Date) => {
    if (
      !selectedWeek ||
      selectedWeek.start.getTime() !== startDate.getTime() ||
      selectedWeek.end.getTime() !== endDate.getTime()
    ) {
      setSelectedWeek({ start: startDate, end: endDate })
      setTimeToDisplay(startDate)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="max-[400px]:w-4/5 w-3/4 sm:max-w-sm">
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
                  <Skeleton className="w-[100px] h-[20px] rounded-md" />
                  <Skeleton className="h-[40px] w-full rounded-md" />
                  <Skeleton className="h-[80px] w-full rounded-md" />
                </div>
              )}
              {isError && (
                <div className="flex h-full items-center justify-center">
                  <p>Ошибка загрузки данных</p>
                </div>
              )}
              {lessons?.length === 0 && !isLoading && !isError && (
                <div className="flex h-full flex-col items-center justify-center">
                  <Image
                    src="assets/ghost.svg"
                    width={200}
                    height={200}
                    alt={''}
                  />
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Нет данных по этой аудитории
                  </p>
                </div>
              )}

              {!isLoading && !isError && (lessons?.length ?? 0) > 0 && (
                <RoomInfoTabContent
                  workload={0}
                  status={'Свободна'}
                  purpose={''}
                  eventName={
                    getCurrentEvent(lessons || [], timeToDisplay)?.subject || ''
                  }
                  teachers={
                    getCurrentEvent(lessons || [], timeToDisplay)?.teachers ||
                    []
                  }
                />
              )}
            </TabsContent>
            <TabsContent value="schedule">
              <ScheduleCalendar
                initialDate={timeToDisplay}
                lessons={lessons || []}
                onWeekChange={handleWeekChange}
                isLoading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default RoomDrawer
