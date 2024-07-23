import { useEffect, useState } from 'react'
import { MapDisplayMode } from './MapDisplayMode'
import { type MapProps } from './MapProps'
import { fetchSvg } from './fetchSvg'
import { Spinner } from '@/components/ui/spinner'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import useScheduleDataStore from '@/lib/stores/scheduleDataStore'
import { Dialog } from '@headlessui/react'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'

const Map = ({ svgUrl }: MapProps) => {
  const displayModeStore = useDisplayModeStore()
  const { mapData } = useMapStore()

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

      const svgElement = document.querySelector('#map svg') as SVGElement
      svgElement.innerHTML = data
    })
  }, [displayModeStore.mode])

  return (
    <>
      <Dialog open={isLoading} onClose={() => {}}>
        <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-white opacity-75">
          <Spinner />
        </div>
      </Dialog>

      {data && mapData && (
        <div dangerouslySetInnerHTML={{ __html: data }} id="map" />
      )}
    </>
  )
}

export default Map
