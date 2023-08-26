import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { type MapData } from "../map/MapData"
import { type Campus, initialCampus } from "../campuses"

interface MapState {
  campus: Campus
  setCampus: (campus: Campus) => void
  floor: number
  setFloor: (floor: number) => void
  mapData: MapData | null
  setMapData: (mapData: MapData | null) => void
}

export const useMapStore = create<MapState>()(
  devtools(
    (set) => ({
      campus: initialCampus,
      floor: initialCampus.initialFloor,
      setCampus: (campus) => {
        set({ campus, floor: campus.initialFloor })
      },
      setFloor: (floor) => set({ floor }),
      mapData: null,
      setMapData: (mapData) => set({ mapData }),
    }),
    { name: "map-store" },
  ),
)
