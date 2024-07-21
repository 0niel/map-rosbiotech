import { useEffect } from 'react'
import ScheduleAPI from '@/lib/schedule/api'
import { type components } from '@/lib/schedule/schema'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { type UseQueryOptions, useQuery } from 'react-query'

export const useRoomsWorkloadQuery = (
  campusId: number,
  options: UseQueryOptions<components['schemas']['WorkloadGet'][], Error>
) => {
  const scheduleAPI = new ScheduleAPI()

  return useQuery<components['schemas']['WorkloadGet'][], Error>(
    ['roomsWorkload', campusId],
    {
      queryFn: async () => {
        const { data, error } = await scheduleAPI.getRoomsWorkload(campusId)
        if (error || !data) throw error

        return data
      },
      ...options
    }
  )
}
