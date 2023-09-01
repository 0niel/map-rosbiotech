import axios, { type AxiosInstance, type AxiosError } from "axios"
import createClient from "openapi-fetch"
import { type paths, type components } from "./schema"

const API_URL = "https://timetable.mirea.ru"

class ScheduleAPI {
  private GET
  private POST

  constructor() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const { GET, POST } = createClient<paths>({ baseUrl: API_URL })

    this.GET = GET
    this.POST = POST
  }

  async getCampuses() {
    const { data, error } = await this.GET("/api/campuses", {
      params: {
        query: {
          limit: 10,
        },
      },
    })

    return { data, error }
  }

  async getRooms(campusId: number) {
    const { data, error } = await this.GET("/api/rooms", {
      params: {
        query: {
          limit: 3000,
          campus_id: campusId,
        },
      },
    })

    return { data, error }
  }

  async getRoomInfo(room_id: number) {
    const { data, error } = await this.GET(`/api/rooms/info/{id}`, {
      params: {
        path: {
          id: room_id,
        },
      },
    })

    return { data, error }
  }

  async getRoomLessons(roomId: number) {
    const { data, error } = await this.GET("/api/lessons/rooms/{id}", {
      params: {
        path: {
          id: roomId,
        },
      },
    })

    return { data, error }
  }

  async getRoomsStatuses(dateTime: Date, campusId: number) {
    const { data, error } = await this.GET("/api/rooms/statuses", {
      params: {
        query: {
          date_time: dateTime.toISOString(),
          campus_id: campusId,
        },
      },
    })

    return { data, error }
  }

  async getRoomStatus(dateTime: Date, roomId: number) {
    const { data, error } = await this.GET("/api/rooms/statuses/{id}", {
      params: {
        query: {
          date_time: dateTime.toISOString(),
        },
        path: {
          id: roomId,
        },
      },
    })

    return { data, error }
  }

  async getRoomsWorkload(campusId: number) {
    const { data, error } = await this.GET("/api/rooms/workload", {
      params: {
        query: {
          campus_id: campusId,
        },
      },
    })

    return { data, error }
  }
}

export default ScheduleAPI
