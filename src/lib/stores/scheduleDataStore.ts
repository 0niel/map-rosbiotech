import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { type MapData } from "../map/MapData"
import { type Campus, initialCampus } from "../campuses"
import { type components } from "../schedule/schema"

interface ScheduleDataStore {
  rooms: components["schemas"]["Room"][]
  setRooms: (rooms: components["schemas"]["Room"][]) => void
}

const useScheduleDataStore = create<ScheduleDataStore>()(
  devtools(
    (set) => ({
      rooms: [],
      setRooms: (rooms) => set({ rooms }),
    }),
    { name: "rooms-store" },
  ),
)

export default useScheduleDataStore
