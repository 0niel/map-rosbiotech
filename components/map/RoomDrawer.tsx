import React from 'react'
import { type components } from '@/lib/schedule/schema'
import { Calendar, Info, QrCodeIcon, Link } from 'lucide-react'
import { RiRouteLine } from 'react-icons/ri'
import RoomInfoTabContent from './RoomInfoTabContent'
import { useQuery } from 'react-query'
import type ScheduleAPI from '@/lib/schedule/api'
import { getAcademicWeek } from '@/lib/schedule/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'

import ScheduleCalendar from './ScheduleCalendar'
import Image from 'next/image'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import QRCode from 'qrcode.react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { toast } from 'react-hot-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  type StrapiResponse,
  searchEmployees,
  searchEmployeesByRoom
} from '@/lib/employees/api'
import { useMapStore } from '@/lib/stores/mapStore'
import { Spinner } from '../ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface RoomDrawerProps {
  isOpen: boolean
  onClose: () => void
  scheduleAPI: ScheduleAPI
  room: components['schemas']['Room'] | null
  roomMapObject: MapObject

  onClickNavigateFromHere: (mapObject: MapObject) => void
  onClickNavigateToHere: (mapObject: MapObject) => void

  findNearestObject: (
    mapObjectType: MapObjectType,
    mapObjectNames: string[]
  ) => void
}

const getCurrentEvent = (
  lessons: components['schemas']['Lesson'][],
  dateTime: Date
) => {
  const date = new Date(dateTime)
  const week = getAcademicWeek(date)
  // weekday 1 - понедельник, 2 - вторник, ...
  const weekday = date.getDay() === 0 ? 7 : date.getDay()

  const currentLessons = lessons.filter(lesson => {
    const lessonWeeks = lesson.weeks
    const lessonWeekday = lesson.weekday

    const isWeekday = lessonWeekday === weekday
    const isWeek = lessonWeeks.includes(week)

    const lessonStartTime = lesson.calls.time_start.slice(0, 5)
    const lessonEndTime = lesson.calls.time_end.slice(0, 5)

    const lessonStartDateTime = new Date(dateTime)
    const lessonEndDateTime = new Date(dateTime)

    const [lessonStartHours, lessonStartMinutes] = lessonStartTime.split(':')
    const [lessonEndHours, lessonEndMinutes] = lessonEndTime.split(':')

    if (
      !lessonStartHours ||
      !lessonStartMinutes ||
      !lessonEndHours ||
      !lessonEndMinutes
    ) {
      return false
    }

    lessonStartDateTime.setHours(parseInt(lessonStartHours))
    lessonStartDateTime.setMinutes(parseInt(lessonStartMinutes))
    lessonEndDateTime.setHours(parseInt(lessonEndHours))
    lessonEndDateTime.setMinutes(parseInt(lessonEndMinutes))

    const isTime = date >= lessonStartDateTime && date <= lessonEndDateTime

    return isWeekday && isWeek && isTime
  })

  if (currentLessons.length === 0) {
    return null
  }

  const currentLesson = currentLessons[0]

  if (!currentLesson) {
    return null
  }

  const discipline = currentLesson.discipline.name
  const teachers = currentLesson.teachers
    .map(teacher => teacher.name)
    .join(', ')

  return { discipline, teachers }
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
  scheduleAPI,
  room,
  roomMapObject,
  onClickNavigateFromHere,
  onClickNavigateToHere,
  findNearestObject
}) => {
  const { timeToDisplay } = useDisplayModeStore()
  const { campus } = useMapStore()

  const { isLoading, isError, data, isFetched } = useQuery(
    ['room', timeToDisplay, roomMapObject],
    {
      queryFn: async () => {
        if (!room) {
          return
        }
        const roomLessons = await scheduleAPI.getRoomLessons(room.id)
        const roomInfo = await scheduleAPI.getRoomInfo(room.id)
        const roomStatus = await scheduleAPI.getRoomStatus(
          timeToDisplay,
          room?.id || 0
        )

        if (roomLessons.error || roomInfo.error || roomStatus.error) {
          throw new Error('Ошибка загрузки данных')
        }

        return {
          lessons: roomLessons.data,
          info: roomInfo.data,
          status: roomStatus.data?.status
        }
      }
    }
  )

  const {
    data: employeeData,
    isLoading: employeeIsLoading,
    isFetched: isEmployeeFetched
  } = useQuery<StrapiResponse>(['employees', roomMapObject], {
    queryFn: async () => {
      const employees = await searchEmployeesByRoom(
        roomMapObject.name,
        campus.shortName
      )
      return employees
    },
    refetchOnWindowFocus: false
  })

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetTitle>
          <div className="flex flex-row items-center">
            <h5
              id="drawer-right-label"
              className="inline-flex items-center text-base font-bold text-gray-900 dark:text-gray-400"
            >
              Аудитория {roomMapObject.name}
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
                          value={generateLink(roomMapObject.id)}
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
                  text={generateLink(roomMapObject.id)}
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
                      onClickNavigateFromHere(roomMapObject)
                    }}
                  >
                    <RiRouteLine className="mr-2 h-5 w-5" />
                    Отсюда
                  </Button>
                  <Button
                    className="w-full"
                    variant={'secondary'}
                    onClick={() => {
                      onClickNavigateToHere(roomMapObject)
                    }}
                  >
                    <RiRouteLine className="mr-2 h-5 w-5 rotate-180 transform" />
                    Сюда
                  </Button>
                </div>
              </div>
              {(isLoading || employeeIsLoading) && (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
                </div>
              )}
              {isError && (
                <div className="flex h-full items-center justify-center">
                  <p>Ошибка загрузки данных</p>
                </div>
              )}
              {isFetched &&
                !data &&
                isEmployeeFetched &&
                employeeData?.data?.length === 0 && (
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
                      ?.discipline || ''
                  }
                  teacher={
                    getCurrentEvent(data?.lessons || [], timeToDisplay)
                      ?.teachers || ''
                  }
                />
              )}

              {!employeeIsLoading &&
              employeeData?.data &&
              employeeData?.data.length > 0 ? (
                <div className="flex flex-col">
                  <p className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">
                    Сотрудники, которые работают в этой аудитории
                  </p>
                  <div className="flex flex-col space-y-4">
                    {employeeData?.data.map(employee => (
                      <div
                        key={employee.id}
                        className="tems-center flex flex-row space-x-2"
                      >
                        {employee.attributes.photo ? (
                          <Image
                            src={employee.attributes.photo.data.attributes.url}
                            alt={`${employee.attributes.firstName} ${employee.attributes.lastName}`}
                            className="h-20 w-20 flex-shrink-0 rounded-full object-cover"
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="h-20 w-20 rounded-full bg-gray-200" />
                        )}

                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-gray-900">
                            {employee.attributes.lastName}{' '}
                            {employee.attributes.firstName}{' '}
                            {employee.attributes.patronymic}
                          </p>

                          {employee.attributes.positions
                            .filter(
                              position =>
                                position.contacts.filter(
                                  contact =>
                                    contact.room?.data.attributes.name ===
                                    roomMapObject.name
                                ).length > 0
                            )
                            .map((position, index) => (
                              <div
                                key={index}
                                className="text-xs text-gray-600"
                              >
                                <p>{position.department}</p>
                                <p>{position.post}</p>
                                {position.contacts.map((contact, i) => (
                                  <div key={i}>
                                    {contact.phone && (
                                      <p>Телефон: {contact.phone}</p>
                                    )}
                                    {contact.IP && <p>IP: {contact.IP}</p>}
                                    {contact.email && (
                                      <p>Email: {contact.email}</p>
                                    )}
                                    {/* {contact.receptionTime && <p>Время приема: {contact.receptionTime}</p>} */}
                                  </div>
                                ))}
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </TabsContent>
            <TabsContent value="schedule">
              {isLoading && (
                <div className="flex h-full items-center justify-center">
                  <Spinner />
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
