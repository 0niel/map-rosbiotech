import { memo } from 'react'

import { useMapStore } from '@/lib/stores/mapStore'
import config from '@/lib/config'

import Map from './Map'

const MapWrapper = () => {
  const { floor } = useMapStore()
  const currentMap = config.svgMaps[`Floor${floor}`]

  return <Map svgUrl={currentMap ?? ''} />
}

export default memo(MapWrapper)
