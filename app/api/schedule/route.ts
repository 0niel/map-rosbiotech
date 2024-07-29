import config from '@/lib/config';
import {
  DataSourceConfig,
  createDataSource
} from '@/lib/schedule/data-source-factory';
import { LessonSchedulePart } from '@/lib/schedule/models/lesson-schedule-part';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get('startDate');
  const endDateParam = url.searchParams.get('endDate');
  const room = url.searchParams.get('room');
  const campus = url.searchParams.get('campus');

  if (!startDateParam || !endDateParam || !room || !campus) {
    return new Response('Missing required query parameters', { status: 400 });
  }

  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return new Response('Invalid date format', { status: 400 });
  }

  const cfg: DataSourceConfig = {
    type: config.schedule.defaultDataSource
  };

  try {
    const dataSource = createDataSource(cfg);
    const lessons: LessonSchedulePart[] = await dataSource.fetchLessons(startDate, endDate, room, campus);
    return new Response(JSON.stringify(lessons), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(error);
    return new Response('Failed to fetch lessons', { status: 500 });
  }
}
