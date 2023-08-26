import { useEffect } from "react"
import { type UseQueryOptions, useQuery } from "react-query"
import { type components } from "~/lib/schedule/schema"
import { useDisplayModeStore } from "~/lib/stores/displayModeStore"
import ScheduleAPI from "~/lib/schedule/api"

export const useRoomsStatusesQuery = (
  campusId: number,
  dateTime: Date,
  options: UseQueryOptions<components["schemas"]["RoomStatusGet"][], Error>,
) => {
  const scheduleAPI = new ScheduleAPI()

  return useQuery<components["schemas"]["RoomStatusGet"][], Error>(["roomsStatuses", campusId], {
    queryFn: async () => {
      const { data, error } = await scheduleAPI.getRoomsStatuses(dateTime, campusId)
      if (error || !data) throw error

      return data
    },
    ...options,
  })
}
