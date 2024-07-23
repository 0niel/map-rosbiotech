
import { type UseQueryOptions, useQuery } from 'react-query'

export const useRoomsQuery = (
  campus: string,
  // options?: UseQueryOptions<components['schemas']['Room'][], Error>
) => {

  return useQuery(['rooms', campus], {
    queryFn: async () => {
      // const { data, error } = await scheduleAPI.getCampuses()
      // if (error || !data) throw error

      // const currentCampusId = data.find(c => c.short_name === campus)?.id
      // if (!currentCampusId) throw new Error('Кампус не найден')

      // const { data: rooms, error: roomsError } =
      //   await scheduleAPI.getRooms(currentCampusId)
      // if (roomsError || !rooms) throw roomsError

      // return rooms
      return []
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,

  })
}
