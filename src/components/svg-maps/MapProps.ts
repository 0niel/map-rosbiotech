import { MapData } from '~/lib/map/MapData'
import { type MapDisplayMode } from './MapDisplayMode'

export type MapProps = {
    onLoaded?: () => void
    svgUrl: string

    displayMode?: MapDisplayMode
}
