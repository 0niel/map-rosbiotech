import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { type MapData } from '../map/MapData'
import { type MapObject } from '../map/MapObject'
import { Campus, initialCampus } from '../campuses'

interface MapState {
    campus: Campus
    setCampus: (campus: Campus) => void
    floor: number
    setFloor: (floor: number) => void
    mapData: MapData | null
    setMapData: (mapData: MapData | null) => void

    // Используется для поиска по карте в SearchDialog
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
            floor: initialCampus.initialFloor,
            setCampus: campus => {
                set({ campus, floor: campus.initialFloor })
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
