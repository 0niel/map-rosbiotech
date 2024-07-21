import { useState } from 'react'
import { type components } from '@/lib/schedule/schema'
import {
  MAX_WEEKS,
  getAcademicWeek,
  getDaysInWeek,
  getNormalizedWeekday,
  getWeekDaysByDate
} from '@/lib/schedule/utils'
import { ChevronLeft, ChevronRight, Paperclip, User2 } from 'lucide-react'
import { PiStudentFill } from 'react-icons/pi'

interface ScheduleCalendarProps {
  date: Date
  lessons: components['schemas']['Lesson'][]
}

/**
 * Группирует занятия по дисциплине, времени начала и дню недели. Если в одно время начала
 * несколько занятий, то в названии группы будут перечислены все группы, у которых
 * есть занятия в это время.
 */
const groupLessonsByGroups = (lessons: components['schemas']['Lesson'][]) => {
  const newLessons: components['schemas']['Lesson'][] = []

  lessons?.forEach(lesson => {
    const newLesson = newLessons.find(newLesson => {
      return (
        newLesson.discipline.name === lesson.discipline.name &&
        newLesson.weekday === lesson.weekday &&
        newLesson.calls.time_start === lesson.calls.time_start
      )
    })

    if (newLesson) {
      if (newLesson.group.name.indexOf(lesson.group.name) === -1) {
        newLesson.group.name += `, ${lesson.group.name}`
      }
    } else {
      newLessons.push(lesson)
    }
  })
  return newLessons
}

const getLessonsForDate = (
  lessons: components['schemas']['Lesson'][],
  date: Date
) => {
  const week = getAcademicWeek(date)
  const weekday = getNormalizedWeekday(date)

  if (!lessons) {
    return []
  }

  const newLessons = lessons.filter(
    (lesson: components['schemas']['Lesson']) => {
      return lesson.weeks.includes(week) && lesson.weekday === weekday
    }
  )

  return newLessons.sort((a, b) => a.calls.num - b.calls.num)
}

export const getEventPointColor = (event: string) => {
  switch (event) {
    case 'пр':
      return 'bg-blue-400'
    case 'лек':
      return 'bg-green-400'
    case 'лаб':
      return 'bg-yellow-400'
    case 'зач':
      return 'bg-red-400'
    default:
      return 'bg-gray-400'
  }
}

function getLessonTypeColor(type: string) {
  switch (type) {
    case 'пр':
      return 'bg-blue-100 text-blue-800'
    case 'лек':
      return 'bg-green-100 text-green-800'
    case 'лаб':
      return 'bg-yellow-100 text-yellow-800'
    case 'зач':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getLessonTypeBackgroundColor(type: string) {
  switch (type) {
    case 'пр':
      return 'bg-blue-50 hover:bg-blue-100'
    case 'лек':
      return 'bg-green-50 hover:bg-green-100'
    case 'лаб':
      return 'bg-yellow-50 hover:bg-yellow-100'
    case 'зач':
      return 'bg-red-50 hover:bg-red-100'
    default:
      return 'bg-gray-50 hover:bg-gray-100'
  }
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  date,
  lessons
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(date)

  const handleClickPrevWeek = () => {
    const selectedWeek = getAcademicWeek(selectedDate)
    const prevWeek = selectedWeek - 1

    if (prevWeek > 0) {
      const daysInPrevWeek = getDaysInWeek(prevWeek)
      const currentWeekDay = getNormalizedWeekday(selectedDate)
      const dateToSelect = daysInPrevWeek[currentWeekDay - 1]

      setSelectedDate(dateToSelect ?? selectedDate)
    }
  }

  const handleClickNextWeek = () => {
    const selectedWeek = getAcademicWeek(selectedDate)
    const nextWeek = selectedWeek + 1

    if (nextWeek <= MAX_WEEKS) {
      const daysInNextWeek = getDaysInWeek(nextWeek)
      const currentWeekDay = getNormalizedWeekday(selectedDate)
      const dateToSelect = daysInNextWeek[currentWeekDay - 1]

      setSelectedDate(dateToSelect ?? selectedDate)
    }
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

  return (
    <div className="flex flex-col rounded-lg p-2">
      <div className="flex flex-row items-center justify-between">
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={() => handleClickPrevWeek()}
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="flex flex-row items-center space-x-2 text-base font-semibold text-gray-700">
          {getMonthName(selectedDate)} • {getAcademicWeek(selectedDate)} неделя
        </h3>
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={() => handleClickNextWeek()}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      {/* Кнопки дней недели */}
      <div className="mb-4 flex w-full flex-row space-x-2">
        {getWeekDaysByDate(selectedDate).map((day: Date) => (
          <button
            className="flex w-full flex-col items-center justify-around ease-in-out"
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
          >
            <p className="text-sm font-medium text-gray-600">
              {day.toLocaleDateString('ru-RU', {
                weekday: 'short'
              })}
            </p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                day.getDate() === selectedDate.getDate()
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm font-medium">{day.getDate()}</p>
            </div>
            <div className="flex flex-row justify-center space-x-0.5">
              {groupLessonsByGroups(getLessonsForDate(lessons, day)).map(
                (lesson, eventIdx) => {
                  return (
                    <div
                      key={eventIdx}
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${getEventPointColor(
                        lesson.lesson_type?.name ?? 'пр'
                      )}`}
                    />
                  )
                }
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Расписание */}
      <div className="flex w-full flex-col space-y-2">
        {groupLessonsByGroups(getLessonsForDate(lessons, selectedDate)).map(
          lesson => (
            <div
              className="flex w-full flex-col space-y-1 rounded-lg border border-gray-200 bg-white p-2"
              key={lesson.id}
            >
              <div className="flex w-full flex-row items-center justify-between space-x-2">
                <span
                  className={`mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium ${getLessonTypeColor(
                    lesson.lesson_type?.name ?? 'пр'
                  )}`}
                >
                  {lesson.lesson_type?.name}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  <span className="mr-2">{lesson.calls.num} пара</span>
                  <span>
                    {lesson.calls.time_start.slice(0, 5)} -{' '}
                    {lesson.calls.time_end.slice(0, 5)}
                  </span>
                </span>
              </div>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  {lesson.discipline.name}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  <User2 size={16} className="mr-1 inline" />
                  {lesson.teachers.map(teacher => teacher.name).join(', ')}
                </p>
                <p className="text-xs font-medium text-gray-500">
                  <PiStudentFill size={16} className="mr-1 inline" />
                  {lesson.group.name}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default ScheduleCalendar
