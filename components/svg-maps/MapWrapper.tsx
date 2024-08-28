import { memo, useRef } from 'react'
import Map from './Map'
import config from '@/lib/config'
import { useMapStore } from '@/lib/stores/mapStore'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'

const MapWrapper = ({
  transformComponentRef
}: Readonly<{
  transformComponentRef: React.RefObject<ReactZoomPanPinchRef> | null
}>) => {
  const { floor, campus, building } = useMapStore()
  const currentMap = building?.svgMaps[floor] || campus.svgMaps[floor]

  return (
    <Map
      svgUrl={currentMap ?? ''}
      transformComponentRef={transformComponentRef}
    />
  )
}

export default memo(MapWrapper)
