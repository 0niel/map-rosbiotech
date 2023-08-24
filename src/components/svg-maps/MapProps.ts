import { MapData } from "~/lib/map/MapData"
import { type MapDisplayMode } from "./MapDisplayMode"

export type MapProps = {
  floor: number
  onLoaded?: () => void
  svgUrl: string

  displayMode?: MapDisplayMode
  mapData: MapData
}
