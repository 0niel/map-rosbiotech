import { useEffect, useRef } from 'react'
import { MapDisplayMode } from './MapDisplayMode'
import { fetchSvg } from './fetchSvg'
import { Spinner } from '@/components/ui/spinner'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import { Dialog } from '@headlessui/react'
import { useQuery } from 'react-query'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { toast } from 'sonner'

const Map = ({
  svgUrl,
  transformComponentRef
}: Readonly<{
  svgUrl: string
  transformComponentRef: React.RefObject<ReactZoomPanPinchRef> | null
}>) => {
  const displayModeStore = useDisplayModeStore()
  const { mapData, floor } = useMapStore()
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { isLoading, data, refetch, status } = useQuery(
    ['map', svgUrl, displayModeStore.mode],
    {
      queryFn: async () => {
        return await fetchSvg(svgUrl)
      },
      onError: error => {
        toast.error('Ошибка при загрузке карты')
      }
    }
  )

  useEffect(() => {
    void refetch().then(() => {
      if (displayModeStore.mode !== MapDisplayMode.DEFAULT || !data) {
        return
      }

      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = data

        const svgElement = mapContainerRef.current?.querySelector('svg')

        if (svgElement && transformComponentRef?.current) {
          transformComponentRef.current.resetTransform()
          transformComponentRef.current.centerView()
          transformComponentRef.current.zoomToElement(
            svgElement as unknown as HTMLElement,
            0.1
          )
        }
      }
    })
  }, [displayModeStore.mode, data, refetch, transformComponentRef])

  return (
    <>
      <Dialog open={isLoading} onClose={() => {}}>
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-white opacity-75">
          <Spinner />
        </div>
      </Dialog>

      {data && mapData && <div id="map" ref={mapContainerRef} />}
    </>
  )
}

export default Map
