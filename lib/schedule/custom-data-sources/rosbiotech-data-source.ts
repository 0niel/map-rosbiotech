import { DataSource } from '../data-source'
import { Classroom } from '../models/classroom'
import { LessonBells } from '../models/lesson-bells'
import { LessonSchedulePart } from '../models/lesson-schedule-part'
import { LessonType } from '../models/lesson-type'
import { Teacher } from '../models/teacher'
import axios from 'axios'

interface RosbiotechLesson {
  _DateOfLesson: string
  _Auditoria: string
  _descPara: string
  _Time: string
  _TimeS: string
  _TimeF: string
  _Week: string
  _Disc: string
  _LectureHall: string
  _TypeEx: string
  _TypeEx_Code: number
  _TypeEx_Description: string
  _weeks: string
  PrepList: string
  PPS_List: {
    PPS: {
      FLCode: number
      FLFIO: string
      FLWork: string
      Link: string
    }
  }
  elLinks: string
  elLinksLink: string
}

interface RosbiotechResponse {
  status: boolean
  data: {
    DatesOfLessons: {
      DateOfLessons: {
        _date: string
        rawDate: string
        _DATEPART: number
        _dayWeek: string
        Lessons: {
          lesson: RosbiotechLesson[]
        }
      }
    }
  }
}

export class RosbiotechDataSource implements DataSource {
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  async fetchLessons(): Promise<LessonSchedulePart[]> {
    const response = await axios.get<RosbiotechResponse>(this.endpoint)
    const lessonsData =
      response.data.data.DatesOfLessons.DateOfLessons.Lessons.lesson

    return lessonsData.map(lesson => {
      const teachers: Teacher[] = [
        {
          name: lesson.PPS_List.PPS.FLFIO,
          uid: lesson.PPS_List.PPS.FLCode.toString(),
          post: lesson.PPS_List.PPS.FLWork,
          photoUrl: '', // URL not provided in the API response
          email: '', // Email not provided in the API response
          phone: '', // Phone not provided in the API response
          department: '' // Department not provided in the API response
        }
      ]

      const classrooms: Classroom[] = [
        {
          name: lesson._LectureHall,
          isOnline: lesson.elLinksLink.includes('http')
        }
      ]

      const lessonBells: LessonBells = {
        start: lesson._TimeS,
        end: lesson._TimeF
      }

      const dates: Date[] = [new Date(lesson._DateOfLesson)]

      return {
        type: 'lesson',
        subject: lesson._Disc,
        lessonType: LessonType.Practice, // Assume 'Practice' for simplicity, map appropriately based on _TypeEx_Code
        teachers,
        classrooms,
        lessonBells,
        dates,
        groups: [] // Groups not provided in the API response
      }
    })
  }
}
