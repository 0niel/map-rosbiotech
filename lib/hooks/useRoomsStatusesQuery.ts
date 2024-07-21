import { useEffect } from 'react'
import ScheduleAPI from '@/lib/schedule/api'
import { type components } from '@/lib/schedule/schema'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import toast from 'react-hot-toast'
import { type UseQueryOptions, useQuery } from 'react-query'

export const useRoomsStatusesQuery = (
  campusId: number,
  dateTime: Date,
  options: UseQueryOptions<components['schemas']['RoomStatusGet'][], Error>
) => {
  const scheduleAPI = new ScheduleAPI()

  return useQuery<components['schemas']['RoomStatusGet'][], Error>(
    ['roomsStatuses', campusId],
    {
      queryFn: async () => {
        const promise = scheduleAPI.getRoomsStatuses(dateTime, campusId)
        const toastId = toast.loading(
          `Загружаем статусы для ${dateTime.toLocaleString()}`
        )

        const { data, error } = await promise.finally(() =>
          toast.success('Статусы загружены', { id: toastId })
        )
        if (error || !data) throw error

        return data
      },
      ...options
    }
  )
}
