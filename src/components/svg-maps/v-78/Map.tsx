import { memo } from 'react'
import Map from '../Map'
import { type MapProps } from '../MapProps'

import Floor1 from './floor_1.svg?url'
import { MapData } from '~/lib/map/MapData'
import { useMapStore } from '~/lib/stores/mapStore'

const maps = [{ floor: 1, svgUrl: Floor1.src }]

const MapWrapper = () => {
    const { floor } = useMapStore()
    const currentMap = maps.find(map => map.floor === floor) as MapProps
    return <Map {...currentMap} />
}

export default memo(MapWrapper)
