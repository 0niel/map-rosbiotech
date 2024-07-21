import { Classroom } from './classroom'
import { LessonBells } from './lesson-bells'
import { LessonType } from './lesson-type'
import { Teacher } from './teacher'

export interface LessonSchedulePart {
  type: string
  subject: string
  lessonType: LessonType
  teachers: Teacher[]
  classrooms: Classroom[]
  lessonBells: LessonBells
  dates: Date[]
  groups?: string[]
}
