import { useEffect } from 'react'
import { type UseQueryOptions, useQuery } from 'react-query'
import { type components } from '~/lib/schedule/schema'
import { useDisplayModeStore } from '~/lib/stores/displayModeStore'
import ScheduleAPI from '~/lib/schedule/api'

export const useRoomsWorkloadQuery = (
    campusId: number,
    options: UseQueryOptions<components['schemas']['WorkloadGet'][], Error>
) => {
    const scheduleAPI = new ScheduleAPI()

    return useQuery<components['schemas']['WorkloadGet'][], Error>(
        ['roomsWorkload', campusId],
        {
            queryFn: async () => {
                const { data, error } =
                    await scheduleAPI.getRoomsWorkload(campusId)
                if (error || !data) throw error

                return data
            },
            ...options
        }
    )
}
