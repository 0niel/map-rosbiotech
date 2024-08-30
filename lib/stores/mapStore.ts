import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Campus, initialCampus } from '../campuses'
import { type MapData } from '../map/MapData'
import { type MapObject } from '../map/MapObject'

interface MapState {
  campus: Campus
  building: {
    name: string
    floors: number[]
    svgMaps: { [key: string]: string }
  } | null
  setCampus: (campus: Campus) => void
  setBuilding: (
    building: {
      name: string
      floors: number[]
      svgMaps: { [key: string]: string }
    } | null
  ) => void
  floor: number
  setFloor: (floor: number) => void
  mapData: MapData | null
  setMapData: (mapData: MapData | null) => void

  selectedFromSearchRoom: {
    name: string
    campus: string
    mapObject: MapObject | null
  } | null
  setSelectedFromSearchRoom: (
    room: {
      name: string
      campus: string
      mapObject: MapObject | null
    } | null
  ) => void
}

export const useMapStore = create<MapState>()(
  devtools(
    set => ({
      campus: initialCampus,
      building: initialCampus.buildings?.find(b => b.isInitial) || null,
      floor:
        initialCampus.buildings?.find(b => b.isInitial)?.floors[0] ??
        initialCampus.initialFloor,
      setCampus: campus => {
        const initialBuilding = campus.buildings?.find(b => b.isInitial) || null
        set({
          campus,
          building: initialBuilding,
          floor: initialBuilding?.floors[0] ?? campus.initialFloor
        })
      },
      setBuilding: building => {
        set({
          building,
          floor: building?.floors[0] ?? initialCampus.initialFloor
        })
      },
      setFloor: floor => set({ floor }),
      mapData: null,
      setMapData: mapData => set({ mapData }),

      selectedFromSearchRoom: null,
      setSelectedFromSearchRoom: selectedFromSearchRoom =>
        set({ selectedFromSearchRoom })
    }),
    { name: 'map-store' }
  )
)
