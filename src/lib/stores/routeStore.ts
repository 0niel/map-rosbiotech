import { create } from "zustand"
import { type Vertex } from "../map/Graph"
import { type MapObject } from "../map/MapObject"

interface RouteStore {
  path: Vertex[][] | null
  setPath: (path: Vertex[][] | null) => void
  startMapObject: MapObject | null
  setStartMapObject: (mapObject: MapObject | null) => void
  endMapObject: MapObject | null
  setEndMapObject: (mapObject: MapObject | null) => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  path: null,
  setPath: (path) => set({ path }),
  startMapObject: null,
  setStartMapObject: (mapObject) => set({ startMapObject: mapObject }),
  endMapObject: null,
  setEndMapObject: (mapObject) => set({ endMapObject: mapObject }),
}))
