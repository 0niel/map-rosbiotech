import { LessonSchedulePart } from './models/lesson-schedule-part'

export interface DataSource {
  fetchLessons(
    startDate: Date,
    endDate: Date,
    room: string,
    campus: string
  ): Promise<LessonSchedulePart[]>
}
