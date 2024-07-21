import { type MapDisplayMode } from './MapDisplayMode'
import { MapData } from '@/lib/map/MapData'

export type MapProps = {
  onLoaded?: () => void
  svgUrl: string

  displayMode?: MapDisplayMode
}
