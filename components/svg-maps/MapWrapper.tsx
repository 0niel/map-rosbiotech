import { memo } from 'react'
import Map from './Map'
import config from '@/lib/config'
import { useMapStore } from '@/lib/stores/mapStore'

const MapWrapper = () => {
  const { floor } = useMapStore()
  const currentMap = config.svgMaps[`Floor${floor}`]

  return <Map svgUrl={currentMap ?? ''} />
}

export default memo(MapWrapper)
