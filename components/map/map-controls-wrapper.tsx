import { Building, Campus } from '@/lib/campuses'
import { MapObject } from '@/lib/map/MapObject'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import MapControls from './map-controls'
import { MapRouteRef } from './map-route'
import MapNavigationButton from './navigation-button'

type MapControlsWrapperProps = {
  transformComponentRef: React.RefObject<ReactZoomPanPinchRef | null>
  building?: Building | null
  campus: Campus
  setNavigationDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  routeStartAndEnd: {
    start: MapObject | null
    end: MapObject | null
    render: boolean
  }
  zoomToMapObject: (mapObject: MapObject, select: boolean) => void
  setRouteStartAndEnd: React.Dispatch<
    React.SetStateAction<{
      start: MapObject | null
      end: MapObject | null
      render: boolean
    }>
  >
  mapRouteRef: React.RefObject<MapRouteRef | null>
}

const MapControlsWrapper = ({
  transformComponentRef,
  building,
  campus,
  setNavigationDialogOpen,
  routeStartAndEnd,
  zoomToMapObject,
  setRouteStartAndEnd,
  mapRouteRef
}: MapControlsWrapperProps) => {
  return (
    <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between py-2 md:py-4">
      <MapNavigationButton
        onClickStart={() => {
          if (!routeStartAndEnd.start) return
          zoomToMapObject(routeStartAndEnd.start, false)
        }}
        onClickEnd={() => {
          if (!routeStartAndEnd.end) return
          zoomToMapObject(routeStartAndEnd.end, false)
        }}
        onClearRoute={() => {
          setRouteStartAndEnd({
            start: null,
            end: null,
            render: false
          })
          mapRouteRef.current?.clearRoute()
        }}
      />

      <div className="fixed bottom-0 z-30 w-full -translate-y-1/2 transform px-2 sm:fixed sm:bottom-5 sm:translate-y-0 md:px-8">
        <MapControls
          onZoomIn={() => transformComponentRef.current?.zoomIn()}
          onZoomOut={() => transformComponentRef.current?.zoomOut()}
          floors={building?.floors || campus.floors || []}
          onNavigatonDialogOpen={() => setNavigationDialogOpen(true)}
        />
      </div>
    </div>
  )
}

export default MapControlsWrapper
