import { useMapStore } from '@/lib/stores/mapStore'
import { memo } from 'react'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import Map from './Map'

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
