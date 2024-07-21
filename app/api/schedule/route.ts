import config from '@/lib/config'
import {
  DataSourceConfig,
  createDataSource
} from '@/lib/schedule/data-source-factory'
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const cfg: DataSourceConfig = {
    type: config.schedule.defaultDataSource
  }

  try {
    const dataSource = createDataSource(cfg)
    const lessons: LessonSchedulePart[] = await dataSource.fetchLessons()
    return Response.json(lessons)
  } catch (error) {
    return Response.error()
  }
}
