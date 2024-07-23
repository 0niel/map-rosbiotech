import { type MapData } from '../map/MapData'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Classroom } from '../schedule/models/classroom'

interface ScheduleDataStore {
  rooms: Classroom[]
  setRooms: (rooms: Classroom[]) => void
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
