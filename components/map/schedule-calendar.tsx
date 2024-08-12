import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, User2 } from 'lucide-react'
import { PiStudentFill } from 'react-icons/pi'
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part'
import { Skeleton } from '../ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LessonType } from '@/lib/schedule/models/lesson-type'

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
    let name = date.toLocaleDateString('ru-RU', {
      month: 'long',
      year: 'numeric'
    })

    name = name[0]?.toUpperCase() + name.slice(1)

    // Обрезаем " г." в конце
    name = name.slice(0, name.length - 3)

    return name
  }

  const firstWeekDate = currentWeek.length > 0 ? currentWeek[0] : undefined
  const weeklyLessons =
    firstWeekDate !== undefined ? getLessonsForWeek(lessons, firstWeekDate) : []

  return (
    <div className="flex flex-col rounded-lg p-2">
      <div className="flex flex-row items-center justify-between">
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={handleClickPrevWeek}
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="flex flex-row items-center space-x-2 text-base font-semibold text-gray-700">
          {getMonthName(selectedDate)} • {selectedDate.getDate()}
        </h3>
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={handleClickNextWeek}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      {/* Кнопки дней недели */}
      <div className="mb-4 flex w-full flex-row space-x-2">
        {currentWeek.map(date => (
          <button
            className="flex w-full flex-col items-center justify-around ease-in-out"
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
          >
            <p className="text-sm font-medium text-gray-600">
              {date.toLocaleDateString('ru-RU', {
                weekday: 'short'
              })}
            </p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                date.getDate() === selectedDate.getDate()
                  ? 'bg-primary/95 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm font-medium">{date.getDate()}</p>
            </div>
            <div className="flex flex-row justify-center space-x-0.5">
              {weeklyLessons
                .find(day => day.date.toISOString() === date.toISOString())
                ?.lessons.map(lesson => (
                  <div
                    key={lesson.subject + lesson.lessonBells.start}
                    className={`mt-1 h-1.5 w-1.5 rounded-full ${getEventPointColor(
                      lesson.lessonType
                    )}`}
                  />
                ))}
            </div>
          </button>
        ))}
      </div>

      {/* Расписание */}
      <div className="flex w-full flex-col space-y-2">
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
        {isLoading && (
          <div className="flex flex-col space-y-3">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduleCalendar
