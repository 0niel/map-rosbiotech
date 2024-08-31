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

const groupLessonsByGroups = (lessons: LessonSchedulePart[]) => {
  const newLessons: LessonSchedulePart[] = []

  lessons?.forEach(lesson => {
    const newLesson = newLessons.find(newLesson => {
      return (
        newLesson.subject === lesson.subject &&
        newLesson.lessonBells.start === lesson.lessonBells.start &&
        newLesson.lessonBells.end === lesson.lessonBells.end &&
        newLesson.dates.some(date => lesson.dates.includes(date))
      )
    })

    if (newLesson) {
      newLesson.groups = newLesson.groups
        ? [...new Set([...newLesson.groups, ...(lesson.groups || [])])]
        : lesson.groups
    } else {
      newLessons.push({ ...lesson })
    }
  })
  return newLessons
}

const getLessonsForWeek = (
  lessons: LessonSchedulePart[],
  startOfWeek: Date
) => {
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    return day
  })

  return daysOfWeek.map(day => ({
    date: day,
    lessons: lessons
      .filter((lesson: LessonSchedulePart) => {
        return lesson.dates.some(lessonDate => {
          const lessonDateObj = new Date(lessonDate)
          return (
            lessonDateObj.toISOString().split('T')[0] ===
            day.toISOString().split('T')[0]
          )
        })
      })
      .sort(
        (a, b) =>
          new Date(`1970-01-01T${a.lessonBells.start}Z`).getTime() -
          new Date(`1970-01-01T${b.lessonBells.start}Z`).getTime()
      )
  }))
}

const getEventPointColor = (event: LessonType) => {
  switch (event) {
    case LessonType.Practice:
      return 'bg-blue-400'
    case LessonType.Lecture:
      return 'bg-green-400'
    case LessonType.LaboratoryWork:
      return 'bg-yellow-400'
    case LessonType.Exam:
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
}

const getLessonTypeColor = (type: LessonType) => {
  switch (type) {
    case LessonType.Practice:
      return 'bg-blue-100 text-blue-800'
    case LessonType.Lecture:
      return 'bg-green-100 text-green-800'
    case LessonType.LaboratoryWork:
      return 'bg-yellow-100 text-yellow-800'
    case LessonType.Exam:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getReadableLessonType = (type: LessonType) => {
  switch (type) {
    case LessonType.Practice:
      return 'Практика'
    case LessonType.Lecture:
      return 'Лекция'
    case LessonType.LaboratoryWork:
      return 'Лаб. работа'
    case LessonType.IndividualWork:
      return 'Сам. работа'
    case LessonType.Consultation:
      return 'Консультация'
    case LessonType.Exam:
      return 'Экзамен'
    case LessonType.Credit:
      return 'Зачет'
    case LessonType.CourseWork:
      return 'Курс. работа'
    case LessonType.CourseProject:
      return 'Курс. проект'
    default:
      return 'Неизвестно'
  }
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
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
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

  const firstWeekDate = currentWeek.length > 0 ? currentWeek[0] : undefined
  const weeklyLessons =
    firstWeekDate !== undefined ? getLessonsForWeek(lessons, firstWeekDate) : []

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
        {currentWeek.map(date => (
          <button
            className="flex w-full flex-col items-center justify-around ease-in-out"
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
          >
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {date.toLocaleDateString('ru-RU', {
                weekday: 'short'
              })}
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
              {weeklyLessons
                .find(day => day.date.toISOString() === date.toISOString())
                ?.lessons.slice(0, 6)
                .map((lesson, index, array) => (
                  <div
                    key={lesson.subject + lesson.lessonBells.start}
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${getEventPointColor(
                      lesson.lessonType
                    )}`}
                  />
                ))}
              {(weeklyLessons.find(
                day => day.date.toISOString() === date.toISOString()
              )?.lessons.length ||
                0 > 6) && (
                <p className="ml-1 text-[11px] font-medium text-gray-600 dark:text-gray-400">
                  {'+'}
                  {(weeklyLessons.find(
                    day => day.date.toISOString() === date.toISOString()
                  )?.lessons.length || 0) - 6}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Расписание */}
      <div className="flex w-full flex-col space-y-2">
        <ScrollArea>
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
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        {isLoading && (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[100px] rounded-md" />
            <Skeleton className="h-[100px] rounded-md" />
            <Skeleton className="h-[100px] rounded-md" />
            <Skeleton className="h-[100px] rounded-md" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduleCalendar
