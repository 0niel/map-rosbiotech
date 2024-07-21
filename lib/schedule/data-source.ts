import { LessonSchedulePart } from './models/lesson-schedule-part'

export interface DataSource {
  fetchLessons(): Promise<LessonSchedulePart[]>
}
