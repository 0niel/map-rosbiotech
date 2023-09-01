// ISO 8601 номер недели
export function getWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function getWeekByDate(date: Date) {
  // 1 сентября 2023 года
  const start_date = new Date(2023, 8, 1)
  const now = date

  if (now < start_date) {
    return 1
  }

  const week = getWeek(now) - getWeek(start_date)

  return week + 1
}

export function getDateByWeek(week: number, weekday: number) {
  // 1 сентября 2022 годаw
  const date = new Date(2022, 8, 1)

  // (1 - понедельник, 2 - вторник, ...)
  const day = date.getDay() === 0 ? 7 : date.getDay()
  const diff = weekday - day

  date.setDate(date.getDate() + diff + (week - 1) * 7)

  return date
}

export function getDaysInWeek(week: number) {
  const days = []

  for (let i = 1; i <= 7; i++) {
    days.push(getDateByWeek(week, i))
  }

  return days
}

export function getWeekDaysByDate(date: Date) {
  const days = []

  for (let i = 1; i <= 7; i++) {
    const day = new Date(date)
    if (date.getDay() === 0) {
      day.setDate(day.getDate() - day.getDay() + i - 7)
    } else {
      day.setDate(day.getDate() - day.getDay() + i)
    }
    days.push(day)
  }

  return days
}
