import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part'
import { LessonType } from '@/lib/schedule/models/lesson-type'

import { ChevronLeft, ChevronRight, User2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PiStudentFill } from 'react-icons/pi'
import { Button } from '../ui/button'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { Skeleton } from '../ui/skeleton'

interface ScheduleCalendarProps {
  initialDate: Date
  lessons: LessonSchedulePart[]
  onWeekChange: (startDate: Date, endDate: Date) => void
  isLoading?: boolean
}

const groupLessonsByGroups = (
  lessons: LessonSchedulePart[]
): LessonSchedulePart[] => {
  return lessons.reduce((groupedLessons, lesson) => {
    const existingLesson = groupedLessons.find(
      newLesson =>
        newLesson.subject === lesson.subject &&
        newLesson.lessonBells.start === lesson.lessonBells.start &&
        newLesson.lessonBells.end === lesson.lessonBells.end &&
        newLesson.dates.some(date => lesson.dates.includes(date))
    )

    if (existingLesson) {
      existingLesson.groups = [
        ...new Set([...(existingLesson.groups || []), ...(lesson.groups || [])])
      ]
    } else {
      groupedLessons.push({ ...lesson })
    }

    return groupedLessons
  }, [] as LessonSchedulePart[])
}

const getLessonsForWeek = (
  lessons: LessonSchedulePart[],
  startOfWeek: Date
) => {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)

    const dailyLessons = lessons
      .filter(lesson =>
        lesson.dates.some(
          date =>
            new Date(date).toISOString().split('T')[0] ===
            day.toISOString().split('T')[0]
        )
      )
      .sort(
        (a, b) =>
          new Date(`1970-01-01T${a.lessonBells.start}Z`).getTime() -
          new Date(`1970-01-01T${b.lessonBells.start}Z`).getTime()
      )

    return { date: day, lessons: dailyLessons }
  })
}

const getEventPointColor = (event: LessonType) => {
  const colors = {
    [LessonType.Practice]: 'bg-blue-400',
    [LessonType.Lecture]: 'bg-green-400',
    [LessonType.LaboratoryWork]: 'bg-yellow-400',
    [LessonType.Exam]: 'bg-red-400',
    [LessonType.IndividualWork]: 'bg-gray-400',
    [LessonType.PhysicalEducation]: 'bg-purple-400',
    [LessonType.Consultation]: 'bg-gray-400',
    [LessonType.Unknown]: 'bg-gray-400',
    [LessonType.Credit]: 'bg-gray-400',
    [LessonType.CourseWork]: 'bg-gray-400',
    [LessonType.CourseProject]: 'bg-gray-400'
  }

  return colors[event] || 'bg-gray-400'
}

const getLessonTypeColor = (type: LessonType) => {
  const colors = {
    [LessonType.Practice]: 'bg-blue-100 text-blue-800',
    [LessonType.Lecture]: 'bg-green-100 text-green-800',
    [LessonType.LaboratoryWork]: 'bg-yellow-100 text-yellow-800',
    [LessonType.Exam]: 'bg-red-100 text-red-800',
    [LessonType.IndividualWork]: 'bg-gray-100 text-gray-800',
    [LessonType.PhysicalEducation]: 'bg-purple-100 text-purple-800',
    [LessonType.Consultation]: 'bg-gray-100 text-gray-800',
    [LessonType.Unknown]: 'bg-gray-100 text-gray-800',
    [LessonType.Credit]: 'bg-gray-100 text-gray-800',
    [LessonType.CourseWork]: 'bg-gray-100 text-gray-800',
    [LessonType.CourseProject]: 'bg-gray-100 text-gray-800'
  }

  return colors[type] || 'bg-gray-100 text-gray-800'
}

const getReadableLessonType = (type: LessonType) => {
  const types: { [key in LessonType]: string } = {
    [LessonType.Practice]: 'Практика',
    [LessonType.Lecture]: 'Лекция',
    [LessonType.LaboratoryWork]: 'Лаб. работа',
    [LessonType.IndividualWork]: 'Сам. работа',
    [LessonType.Consultation]: 'Консультация',
    [LessonType.Exam]: 'Экзамен',
    [LessonType.Credit]: 'Зачет',
    [LessonType.CourseWork]: 'Курс. работа',
    [LessonType.CourseProject]: 'Курс. проект',
    [LessonType.PhysicalEducation]: 'Физическая культура',
    [LessonType.Unknown]: 'Неизвестно'
  }
  return types[type] || 'Неизвестно'
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  initialDate,
  lessons,
  onWeekChange,
  isLoading
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [currentWeek, setCurrentWeek] = useState<Date[]>([])

  useEffect(() => {
    const startOfWeek = new Date(selectedDate)
    const dayOfWeek = startOfWeek.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Смещаем на понедельник
    startOfWeek.setDate(startOfWeek.getDate() + diff)

    const newWeek = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      return day
    })

    setCurrentWeek(newWeek)
    onWeekChange(
      startOfWeek,
      new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000)
    )
  }, [selectedDate, onWeekChange])

  const handleClickPrevWeek = () => {
    setSelectedDate(prev => {
      const prevWeek = new Date(prev)
      prevWeek.setDate(prevWeek.getDate() - 7)
      return prevWeek
    })
  }

  const handleClickNextWeek = () => {
    setSelectedDate(prev => {
      const nextWeek = new Date(prev)
      nextWeek.setDate(nextWeek.getDate() + 7)
      return nextWeek
    })
  }

  const getMonthName = (date: Date) => {
    const months = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря'
    ]
    return `${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const firstWeekDate = currentWeek[0]
  const weeklyLessons = firstWeekDate
    ? getLessonsForWeek(lessons, firstWeekDate)
    : []

  return (
    <div className="flex flex-col rounded-lg p-2">
      <div className="flex flex-row items-center justify-between">
        <Button
          type="button"
          variant={'ghost'}
          className="rounded-lg p-2 text-sm font-medium"
          onClick={handleClickPrevWeek}
        >
          <ChevronLeft size={24} />
        </Button>
        <h3 className="text-base font-semibold">
          {selectedDate.getDate()} {getMonthName(selectedDate)}
        </h3>
        <Button
          type="button"
          variant={'ghost'}
          className="rounded-lg p-2 text-sm font-medium"
          onClick={handleClickNextWeek}
        >
          <ChevronRight size={24} />
        </Button>
      </div>
      {/* Кнопки дней недели */}
      <div className="mb-4 flex w-full flex-row space-x-2">
        {currentWeek.map(date => {
          const dailyLessons = groupLessonsByGroups(
            weeklyLessons.find(
              day => day.date.toISOString() === date.toISOString()
            )?.lessons || []
          )
          const hiddenLessons = dailyLessons.length - 6

          return (
            <button
              className="flex w-full flex-col items-center justify-around ease-in-out"
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-md ${
                  date.getDate() === selectedDate.getDate()
                    ? 'bg-primary/95 text-white'
                    : 'bg-gray-100 text-gray-900 dark:bg-secondary dark:text-white'
                }`}
              >
                <p className="text-sm font-medium">{date.getDate()}</p>
              </div>
              <div className="flex flex-row justify-center space-x-0.5">
                {dailyLessons.slice(0, 6).map((lesson, index) => (
                  <div
                    key={lesson.subject + lesson.lessonBells.start}
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${getEventPointColor(
                      lesson.lessonType
                    )}`}
                  />
                ))}
                {hiddenLessons > 0 && (
                  <p className="ml-1 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                    {`+${hiddenLessons}`}
                  </p>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Расписание */}
      <ScrollArea className="h-[calc(100vh-267px)]">
        <div className="flex flex-col space-y-2">
          {groupLessonsByGroups(
            weeklyLessons.find(
              day => day.date.toISOString() === selectedDate.toISOString()
            )?.lessons || []
          ).map(lesson => (
            <Card
              key={lesson.subject + lesson.lessonBells.start}
              className="w-full"
            >
              <CardHeader>
                <CardTitle className="text-md font-semibold">
                  {lesson.subject}
                </CardTitle>
                <CardDescription className="flex flex-row items-center space-x-3">
                  <div>
                    <span className="mr-2">
                      {lesson.lessonBells.number
                        ? `${lesson.lessonBells.number} пара`
                        : ''}
                    </span>
                    <span>
                      {lesson.lessonBells.start.slice(0, 5)} -{' '}
                      {lesson.lessonBells.end.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <span
                      className={`flex h-2 w-2 translate-y-1.5 items-center rounded-full ${getLessonTypeColor(
                        lesson.lessonType
                      )}`}
                    />

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        {getReadableLessonType(lesson.lessonType)}
                      </p>
                    </div>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    <User2 size={16} className="mr-1 inline" />
                    {lesson.teachers.map(teacher => teacher.name).join(', ')}
                  </p>
                  {lesson.groups && (
                    <p className="text-xs font-medium text-muted-foreground">
                      <PiStudentFill size={16} className="mr-1 inline" />
                      {lesson.groups.join(', ')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {isLoading && (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[100px] rounded-md" />
            <Skeleton className="h-[100px] rounded-md" />
            <Skeleton className="h-[100px] rounded-md" />
          </div>
        )}
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  )
}

export default ScheduleCalendar
