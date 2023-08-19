import { ChevronLeft, ChevronRight, User2, Paperclip } from "lucide-react"
import { useState } from "react"
import { getWeekDaysByDate, getWeekByDate } from "~/lib/schedule/utils"
import { type components } from "~/lib/schedule/schema"

interface ScheduleCalendarProps {
  date: Date
  lessons: components["schemas"]["Lesson"][]
}

const geеLessonsByDate = (lessons: components["schemas"]["Lesson"][], date: Date) => {
  const week = getWeekByDate(date)
  const weekday = date.getDay() === 0 ? 7 : date.getDay()

  const currentLessons = lessons.filter((lesson) => {
    const lessonWeeks = lesson.weeks
    const lessonWeekday = lesson.weekday

    const isWeekday = lessonWeekday === weekday
    const isWeek = lessonWeeks.includes(week)

    return isWeekday && isWeek
  })

  return currentLessons
}

const joinLessonsByGroups = (lessons: components["schemas"]["Lesson"][]) => {
  const newLessons: components["schemas"]["Lesson"][] = []

  lessons?.forEach((lesson) => {
    const newLesson = newLessons.find((newLesson) => {
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

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ date, lessons }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(date)

  return (
    <div className="flex flex-col space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-2">
      <div className="flex flex-row items-center justify-between">
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 7)))}
        >
          <ChevronLeft size={24} />
        </button>
        <h3 className="text-base font-semibold text-gray-700">
          {selectedDate.toLocaleDateString("ru-RU", {
            month: "long",
            year: "numeric",
          })}{" "}
          • {getWeekByDate(selectedDate)} неделя
        </h3>
        <button
          type="button"
          className="rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500"
          onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 7)))}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      {/* Кнопки дней недели */}
      <div className="flex w-full flex-row space-x-2">
        {getWeekDaysByDate(selectedDate).map((day: Date) => (
          <button
            className="flex w-full flex-col items-center justify-around ease-in-out"
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
          >
            <p className="text-sm font-medium text-gray-600">
              {day.toLocaleDateString("ru-RU", {
                weekday: "short",
              })}
            </p>
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-md ${
                day.getDate() === selectedDate.getDate() ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm font-medium">{day.getDate()}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Расписание */}
      <div className="flex w-full flex-col space-y-2">
        {joinLessonsByGroups(geеLessonsByDate(lessons, selectedDate)).map((lesson) => (
          <div
            className="flex w-full flex-col space-y-1 rounded-lg border border-gray-300 bg-white p-2"
            key={lesson.id}
          >
            <div className="flex w-full flex-row items-center justify-between space-x-2">
              <span className="mr-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {lesson.lesson_type?.name}
              </span>
              <span className="text-xs font-medium text-gray-500">
                {lesson.calls.time_start.slice(0, 5)} - {lesson.calls.time_end.slice(0, 5)}
              </span>
            </div>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium text-gray-700">
                <Paperclip size={16} className="mr-1 inline" />
                {lesson.discipline.name}
              </p>
              <p className="text-xs font-medium text-gray-500">
                <User2 size={16} className="mr-1 inline" />
                {lesson.teachers.map((teacher) => teacher.name).join(", ")}
              </p>
              <p className="text-xs font-medium text-gray-500">
                <User2 size={16} className="mr-1 inline" />
                {lesson.group.name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduleCalendar
