import axios from 'axios'
import { DataSource } from '../data-source'
import { Classroom } from '../models/classroom'
import { LessonBells } from '../models/lesson-bells'
import { LessonSchedulePart } from '../models/lesson-schedule-part'
import { LessonType } from '../models/lesson-type'
import { Teacher } from '../models/teacher'

const ROOM_GUID_SEARCH_ENDPOINT = 'http://192.168.124.16:8000/search'
const LESSONS_API_ENDPOINT =
  'https://api.cloud.mgupp.ru/events-api-mgupp/v2/rasp/Rasp_GetLesson_OfTheDays_Room'

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
  Uchgroups: {
    UchGr: string
  }
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
  error?: string
  data?: {
    DatesOfLessons: {
      DateOfLessons: Array<{
        _date: string
        rawDate: string
        _DATEPART: number
        _dayWeek: string
        Lessons: {
          lesson: RosbiotechLesson | RosbiotechLesson[]
        }
      }>
    }
  }
}

export class RosbiotechDataSource implements DataSource {
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  private async getRoomGuid(campus: string, room: string): Promise<string> {
    const response = await axios.post(ROOM_GUID_SEARCH_ENDPOINT, {
      campus,
      room
    })

    const roomId = response.data[0].id.toUpperCase()
    return `0x${roomId}`
  }

  private formatDate(date: Date): string {
    const isoString = date.toISOString()
    if (!isoString) throw new Error('Invalid date format')

    const [datePart] = isoString.split('T')
    if (!datePart) throw new Error('Invalid date format')

    const [year, month, day] = datePart.split('-')
    if (!year || !month || !day) throw new Error('Invalid date format')

    return `${day}.${month}.${year}`
  }

  private mapLessonType(type: string): LessonType {
    switch (type) {
      case 'ЛК':
        return LessonType.Lecture
      case 'ПР':
        return LessonType.Practice
      case 'ЛР':
        return LessonType.LaboratoryWork
      default:
        return LessonType.Unknown
    }
  }

  private extractLessonNumber(descPara: string): number | null {
    try {
      const match = descPara.match(/^(\d+) пара/)
      return match ? parseInt(match[1] || '', 10) : null
    } catch (e) {
      return null
    }
  }

  private getCampusByShortName(shortName: string): string {
    switch (shortName) {
      case 'Сокол':
        return '125080, г. Москва, Волоколамское ш., д.11'
      default:
        return '125080, г. Москва, Волоколамское ш., д.11'
    }
  }

  private parseDate(dateString: string): Date | null {
    const [day, month, year] = dateString.split('.')
    if (!day || !month || !year) return null
    return new Date(`${year}-${month}-${day}`)
  }

  async fetchLessons(
    startDate: Date,
    endDate: Date,
    room: string,
    campus: string
  ): Promise<LessonSchedulePart[]> {
    campus = this.getCampusByShortName(campus)

    const roomGuid = await this.getRoomGuid(campus, room)
    console.info('Room guid for ', room, ' is ', roomGuid)
    const dates = []
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      dates.push(this.formatDate(d))
    }

    try {
      const requestUrl = `${LESSONS_API_ENDPOINT}?DateList=${dates.join(
        ','
      )}&RoomGuid=${roomGuid}&format=json`
      console.info('Requesting lessons from Rosbiotech API: ', requestUrl)
      const response = await axios.get<RosbiotechResponse>(requestUrl)
      console.info('Response from Rosbiotech API: ', response.data)

      if (!response.data.status) {
        console.error('Error fetching lessons:', response.data.error)
        throw new Error(response.data.error || 'Unknown error')
      }

      const lessonsData = response.data.data?.DatesOfLessons?.DateOfLessons

      if (!lessonsData || lessonsData.length === 0) {
        console.error('No lesson data available')
        return []
      }

      const lessonsArray: RosbiotechLesson[] = []

      lessonsData.forEach(dateLesson => {
        if (Array.isArray(dateLesson.Lessons.lesson)) {
          lessonsArray.push(...dateLesson.Lessons.lesson)
        } else {
          lessonsArray.push(dateLesson.Lessons.lesson)
        }
      })

      console.info('Lessons data:', lessonsArray)

      return lessonsArray.map(lesson => {
        const teachers: Teacher[] = [
          {
            name: lesson.PPS_List.PPS.FLFIO,
            uid: lesson.PPS_List.PPS.FLCode.toString(),
            post: lesson.PPS_List.PPS.FLWork
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
          end: lesson._TimeF,
          number: this.extractLessonNumber(lesson._descPara) ?? undefined
        }

        const dates: Date[] = [this.parseDate(lesson._DateOfLesson)].filter(
          date => date !== null
        )

        return {
          type: 'lesson',
          subject: lesson._Disc,
          lessonType: this.mapLessonType(lesson._TypeEx),
          teachers,
          classrooms,
          lessonBells,
          dates,
          groups: [lesson.Uchgroups.UchGr]
        }
      })
    } catch (error) {
      console.error('Error fetching lessons:', error)
      return []
    }
  }
}
