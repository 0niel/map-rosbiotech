import { memo, useRef } from 'react'
import Map from './Map'
import config from '@/lib/config'
import { useMapStore } from '@/lib/stores/mapStore'

const MapWrapper = ({
  ref
}: Readonly<{
  ref: React.MutableRefObject<SVGElement | null>
}>) => {
  const { floor } = useMapStore()
  const currentMap = config.svgMaps[`Floor${floor}`]

  return <Map svgUrl={currentMap ?? ''} svgRef={ref} />
}

export default memo(MapWrapper)
