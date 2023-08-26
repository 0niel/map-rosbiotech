import { useQuery, type UseQueryOptions } from "react-query"
import ScheduleAPI from "~/lib/schedule/api"
import { type components } from "../schedule/schema"

export const useRoomsQuery = (campus: string, options?: UseQueryOptions<components["schemas"]["Room"][], Error>) => {
  const scheduleAPI = new ScheduleAPI()

  return useQuery<components["schemas"]["Room"][], Error>(["rooms", campus], {
    queryFn: async () => {
      const { data, error } = await scheduleAPI.getCampuses()
      if (error || !data) throw error

      const currentCampusId = data.find((c) => c.short_name === campus)?.id
      if (!currentCampusId) throw new Error("Кампус не найден")

      const { data: rooms, error: roomsError } = await scheduleAPI.getRooms(currentCampusId)
      if (roomsError || !rooms) throw roomsError

      return rooms
    },
    ...options,
  })
}
