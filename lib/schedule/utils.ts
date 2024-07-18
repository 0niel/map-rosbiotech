export const MAX_WEEKS = 18

enum Semester {
  AUTUMN = 1,
  SPRING = 2
}

interface Period {
  yearStart: number
  yearEnd: number
  semester: Semester
}

/**
 * Получить номер недели по дате (ISO 8601)
 * @see https://stackoverflow.com/a/6117889
 */
export function getWeek(date: Date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Получить номер учебной недели по дате относительно начала семестра
 */
export function getAcademicWeek(date: Date) {
  const period = getPeriod(date)
  const startDate = getSemesterStart(period)

  if (date.getTime() < startDate.getTime()) {
    return 1
  }

  const week = getWeek(date) - getWeek(startDate)

  if (week <= 0) {
    return 1
  }

  if (week > MAX_WEEKS) {
    return MAX_WEEKS
  }

  return week + 1
}

/**
 * Получить номер дня недели (1 — понедельник, 2 — вторник и так далее, 7 — воскресенье)
 * @param date Дата
 * @see https://github.com/mirea-ninja/rtu-schedule-parser/blob/bc34669561eb2e05f78fbbebfb072c39dab323ca/rtu_schedule_parser/utils/academic_calendar.py#L45
 */
export const getNormalizedWeekday = (date: Date) => {
  const day = date.getDay()

  if (day === 0) {
    return 7
  }

  return day
}

/**
 * Получить дату по номеру недели и дню недели
 * @param week Номер недели
 * @param weekDay День недели (1 — понедельнику, 2 — вторнику и так далее, 7 — воскресенье)
 */
export function getDateByWeek(week: number, weekDay: number) {
  const period = getPeriod(new Date())
  const startDate = getSemesterStart(period)

  if (week === 1) {
    return new Date(
      startDate.getTime() +
        (weekDay - getNormalizedWeekday(startDate)) * 24 * 60 * 60 * 1000
    )
  }

  const value =
    startDate.getTime() +
    (week - 1) * 7 * 24 * 60 * 60 * 1000 +
    (weekDay - getNormalizedWeekday(startDate)) * 24 * 60 * 60 * 1000

  return new Date(value)
}

/**
 * Получить даты всех дней недели по номеру недели
 * @param week Номер недели
 * @returns Даты всех дней недели с понедельника по воскресенье
 */
export function getDaysInWeek(week: number) {
  const days = []

  for (let i = 1; i <= 7; i++) {
    const day = getDateByWeek(week, i)
    days.push(day)
  }

  return days
}

/**
 * Получить даты всех дней недели по дате
 * @param date Дата
 * @returns Даты всех дней недели с понедельника по воскресенье
 */
export function getWeekDaysByDate(date: Date) {
  const week = getAcademicWeek(date)
  return getDaysInWeek(week)
}

/**
 * Получить текущий период. Период - это некоторый промежуток времени, к которому относится расписание.
 * Например, если сейчас март 2021 года, то текущий период - это весенний семестр 2020/2021 учебного года.
 * Год начала периода - это год начала учебного года, а год конца периода - это год конца учебного года (не семестра).
 * @param date Дата, для которой нужно получить период
 * @returns Текущий период
 * @see https://github.com/mirea-ninja/rtu-schedule-parser/blob/main/rtu_schedule_parser/utils/academic_calendar.py
 */
export function getPeriod(date: Date): Period {
  // Если текущий месяц август или позже, то это осенний семестр.
  // Считаем с августа, так как именно в августе начинают публиковать расписание
  if (date.getMonth() >= 7) {
    return {
      yearStart: date.getFullYear(),
      yearEnd: date.getFullYear() + 1,
      semester: Semester.AUTUMN
    }
  } else {
    return {
      yearStart: date.getFullYear() - 1,
      yearEnd: date.getFullYear(),
      semester: Semester.SPRING
    }
  }
}

/**
 * Получить дату начала семестра
 * @see https://github.com/mirea-ninja/rtu-schedule-parser/blob/main/rtu_schedule_parser/utils/academic_calendar.py
 */
export function getSemesterStart(period: Period) {
  if (period.semester === Semester.AUTUMN) {
    // 1 сентября
    let startDate = new Date(period.yearStart, 8, 1)
    if (startDate.getUTCDay() === 0) {
      // Если 1 сентября - это воскресенье, то начало семестра - это 2 сентября
      startDate = new Date(period.yearStart, 8, 2)
    }
    return startDate
  }

  // 1 февраля
  let startDate = new Date(period.yearEnd, 1, 1)
  // + 8 дней каникул
  startDate = new Date(startDate.getTime() + 8 * 24 * 60 * 60 * 1000)
  if (startDate.getUTCDay() === 0) {
    // Если первый день после каникул - это воскресенье, то добавляем ещё один день
    startDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000)
  }

  return startDate
}
