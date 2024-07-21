import { type MapData } from '../map/MapData'
import { type components } from '../schedule/schema'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface ScheduleDataStore {
  rooms: components['schemas']['Room'][]
  setRooms: (rooms: components['schemas']['Room'][]) => void
}

const useScheduleDataStore = create<ScheduleDataStore>()(
  devtools(
    set => ({
      rooms: [],
      setRooms: rooms => set({ rooms })
    }),
    { name: 'rooms-store' }
  )
)

export default useScheduleDataStore
