import axios, { type AxiosInstance, type AxiosError } from "axios"
import { type components } from "./schema"

const API_URL = "https://timetable.mirea.ninja/api"

class ScheduleAPI {
  private apiClient: AxiosInstance

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: false,
    })
  }

  private handleError(error: AxiosError) {
    console.error("API Error:", error.response)
    throw error
  }

  async getCampuses(): Promise<components["schemas"]["Campus"][]> {
    const response = await this.apiClient.get("/campuses")

    return response.data as components["schemas"]["Campus"][]
  }

  async getRooms(campus_id: number): Promise<components["schemas"]["Room"][]> {
    const response = await this.apiClient.get(`/rooms?campus_id=${campus_id}&limit=500&offset=0`)

    return response.data as components["schemas"]["Room"][]
  }

  async getRoomInfo(room_id: number): Promise<components["schemas"]["RoomInfo"]> {
    const response = await this.apiClient.get(`/rooms/info/${room_id}`)

    return response.data as components["schemas"]["RoomInfo"]
  }

  async getRoomSchedule(room_id: number): Promise<components["schemas"]["Lesson"][]> {
    const response = await this.apiClient.get(`/lessons/rooms/${room_id}`)

    return response.data as components["schemas"]["Lesson"][]
  }

  async getRoomsStatuses(
    dateTime: Date,
    room_ids: number[],
  ): Promise<
    {
      name: string
      status: string
    }[]
  > {
    const response = await this.apiClient.get(
      `/rooms/statuses?date_time=${dateTime.toISOString()}&ids=${room_ids.join("&ids=")}`,
    )

    return response.data as {
      name: string
      status: string
    }[]
  }
}

export default ScheduleAPI
