import { type Vertex } from '@/lib/map/Graph'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import { useRouteStore } from '@/lib/stores/routeStore'
import { BiWalk } from 'react-icons/bi'
import { TbStairsUp, TbStairsDown } from 'react-icons/tb'
import { useCallback } from 'react'
import { X } from 'lucide-react'
import { FaShare } from 'react-icons/fa'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { toast } from 'react-hot-toast'

interface RouteDetailsProps {
  onDetailsSlideChange: (detailsSlide: DetailsSlide) => void
  onDetailsSlideClick: (detailsSlide: DetailsSlide) => void
  onClose: () => void
}

export interface DetailsSlide {
  floor: number
  mapObjectToZoom?: MapObject
  text: string
  icon?: React.ReactNode
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  onDetailsSlideChange,
  onDetailsSlideClick,
  onClose
}) => {
  const { path } = useRouteStore()
  const { mapData } = useMapStore()

  const generateLink = () => {
    if (!path) {
      toast.error('Не удалось сгенерировать ссылку на маршрут')
      return
    }

    const start = path.at(0)?.at(0)?.mapObjectId
    const endSegment = path.at(path.length - 1)
    const end = endSegment?.at(endSegment.length - 1)?.mapObjectId

    if (!start || !end) {
      toast.error('Не удалось сгенерировать ссылку на маршрут')
      return
    }

    return `${window.location.origin}/?start=${start}&end=${end}`
  }

  const getRouteDetailsByPath = useCallback((): DetailsSlide[] => {
    const routeDetails: DetailsSlide[] = []

    if (!path || !mapData) {
      return []
    }

    const firstSegment = path[0] || []
    const lastSegment = path[path.length - 1] || []
    const firstPoint = firstSegment[0] || ({ x: 0, y: 0 } as Vertex)
    const lastPoint =
      lastSegment[lastSegment.length - 1] || ({ x: 0, y: 0 } as Vertex)

    routeDetails.push({
      floor: mapData.getFloorByPoint(firstPoint),
      mapObjectToZoom: mapData.getMapObjectById(firstPoint.mapObjectId || ''),
      text: 'Начало маршрута',
      icon: (
        <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full font-medium text-blue-800">
          А
        </div>
      )
    })

    for (let i = 0; i < path.length; i++) {
      const pathSegment = path[i]
      if (!pathSegment || !pathSegment[0]) {
        continue
      }

      const floor = mapData.getFloorByPoint(pathSegment[0])
      if (pathSegment.length > 1) {
        routeDetails.push({
          floor,
          text: `Маршрут по этажу ${floor}`,
          icon: <BiWalk className="h-3 w-3 text-blue-800" />
        })
      }

      const nextSegment = path[i + 1]
      const currentSegmentFloor = mapData.getFloorByPoint(pathSegment[0])

      const lastVertex = pathSegment[pathSegment.length - 1] as Vertex
      const lastVertexMapObject = mapData.getMapObjectById(
        lastVertex.mapObjectId || ''
      )
      if (lastVertexMapObject) {
        if (
          lastVertexMapObject.type === MapObjectType.STAIRS &&
          nextSegment &&
          nextSegment[0]
        ) {
          const nextFloor = mapData.getFloorByPoint(nextSegment[0])

          if (nextFloor > currentSegmentFloor) {
            routeDetails.push({
              floor: nextFloor,
              mapObjectToZoom: mapData.getMapObjectById(
                nextSegment[0].mapObjectId || ''
              ),
              text: `Подъём на этаж ${nextFloor}`,
              icon: <TbStairsUp className="h-3 w-3 text-blue-800" />
            })
          } else if (nextFloor < currentSegmentFloor) {
            routeDetails.push({
              floor: nextFloor,
              mapObjectToZoom: mapData.getMapObjectById(
                nextSegment[0].mapObjectId || ''
              ),
              text: `Спуск на этаж ${nextFloor}`,
              icon: <TbStairsDown className="h-3 w-3 text-blue-800" />
            })
          }
        }
      }
    }

    routeDetails.push({
      floor: mapData.getFloorByPoint(lastPoint),
      mapObjectToZoom: mapData.getMapObjectById(lastPoint.mapObjectId || ''),
      text: 'Конец маршрута',
      icon: (
        <div className="flex h-2.5 w-2.5 items-center justify-center rounded-full font-medium text-blue-800">
          Б
        </div>
      )
    })

    return routeDetails
  }, [mapData, path])

  return (
    <div className="flex-colbg-white scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100 pointer-events-auto mx-auto flex max-h-44 w-[calc(100vw-5rem)] overflow-y-auto rounded-xl border border-gray-300 bg-white px-8 py-6 sm:w-[28rem]">
      <div className="absolute right-8 top-4 z-10 mb-4 flex items-center space-x-2">
        <CopyToClipboard
          text={generateLink() || ''}
          onCopy={() => {
            toast.success('Ссылка скопирована в буфер обмена')
          }}
        >
          <button
            type="button"
            className="flex items-center rounded-lg bg-gray-100 p-1.5 text-sm text-gray-900 hover:bg-gray-300 hover:text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300"
          >
            <FaShare className="h-5 w-5" />
          </button>
        </CopyToClipboard>
        <button
          type="button"
          className="pointer-events-auto top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
          onClick={onClose}
        >
          <X size={20} />
          <span className="sr-only">Закрыть окно</span>
        </button>
      </div>
      <div className="flex h-full flex-col">
        <ol className="relative border-l border-gray-200">
          {path &&
            getRouteDetailsByPath().map((detailsSlide, index) => (
              <li
                className="group mb-10 ml-6 cursor-pointer focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 hover:bg-gray-50"
                key={index}
                onClick={() => onDetailsSlideClick(detailsSlide)}
              >
                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-8 ring-white group-hover:ring-blue-200 group-focus:ring-blue-200">
                  {detailsSlide.icon}
                </span>
                <p className="mb-1 flex items-center text-base font-normal text-gray-500">
                  {detailsSlide.text}
                </p>
              </li>
            ))}
        </ol>
      </div>
    </div>
  )
}

export default RouteDetails
