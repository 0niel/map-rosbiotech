import { Carousel } from "flowbite-react"
import { type Vertex } from "~/lib/map/Graph"
import { type MapData } from "~/lib/map/MapData"
import { type MapObject, MapObjectType } from "~/lib/map/MapObject"
import { useMapStore } from "~/lib/stores/mapStore"
import { useRouteStore } from "~/lib/stores/routeStore"
import { BiWalk } from "react-icons/bi"
import { TbStairsUp, TbStairsDown } from "react-icons/tb"
import { use, useCallback } from "react"
import { X } from "lucide-react"
import { FaShare } from "react-icons/fa"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { toast } from "react-hot-toast"

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

const RouteDetails: React.FC<RouteDetailsProps> = ({ onDetailsSlideChange, onDetailsSlideClick, onClose }) => {
  const { path } = useRouteStore()
  const { floor, mapData } = useMapStore()

  const generateLink = () => {
    if (!path) {
      toast.error("Не удалось сгенерировать ссылку на маршрут")
      return
    }

    const start = path.at(0)?.at(0)?.mapObjectId
    const endSegment = path.at(path.length - 1)
    const end = endSegment?.at(endSegment.length - 1)?.mapObjectId

    if (!start || !end) {
      toast.error("Не удалось сгенерировать ссылку на маршрут")
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
    const lastPoint = lastSegment[lastSegment.length - 1] || ({ x: 0, y: 0 } as Vertex)

    routeDetails.push({
      floor: mapData.getFloorByPoint(firstPoint),
      mapObjectToZoom: mapData.getMapObjectById(firstPoint.mapObjectId || ""),
      text: "Начало маршрута",
      icon: (
        <div className="w-2.5 h-2.5 text-blue-800 font-medium rounded-full flex items-center justify-center">А</div>
      ),
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
          icon: <BiWalk className="w-3 h-3 text-blue-800" />,
        })
      }

      const nextSegment = path[i + 1]
      const currentSegmentFloor = mapData.getFloorByPoint(pathSegment[0])

      const lastVertex = pathSegment[pathSegment.length - 1] as Vertex
      const lastVertexMapObject = mapData.getMapObjectById(lastVertex.mapObjectId || "")
      if (lastVertexMapObject) {
        if (lastVertexMapObject.type === MapObjectType.STAIRS && nextSegment && nextSegment[0]) {
          const nextFloor = mapData.getFloorByPoint(nextSegment[0])

          if (nextFloor > currentSegmentFloor) {
            routeDetails.push({
              floor: nextFloor,
              mapObjectToZoom: mapData.getMapObjectById(nextSegment[0].mapObjectId || ""),
              text: `Подъём на этаж ${nextFloor}`,
              icon: <TbStairsUp className="w-3 h-3 text-blue-800" />,
            })
          } else if (nextFloor < currentSegmentFloor) {
            routeDetails.push({
              floor: nextFloor,
              mapObjectToZoom: mapData.getMapObjectById(nextSegment[0].mapObjectId || ""),
              text: `Спуск на этаж ${nextFloor}`,
              icon: <TbStairsDown className="w-3 h-3 text-blue-800" />,
            })
          }
        }
      }
    }

    routeDetails.push({
      floor: mapData.getFloorByPoint(lastPoint),
      mapObjectToZoom: mapData.getMapObjectById(lastPoint.mapObjectId || ""),
      text: "Конец маршрута",
      icon: (
        <div className="w-2.5 h-2.5 text-blue-800 font-medium rounded-full flex items-center justify-center">Б</div>
      ),
    })

    return routeDetails
  }, [mapData, path])

  return (
    <div className="flex flex-colbg-white rounded-xl border px-8 py-6 mx-auto sm:w-[28rem] w-[calc(100vw-5rem)] max-h-44 overflow-y-auto border-gray-300 pointer-events-auto bg-white scrollbar scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="flex items-center mb-4 space-x-2 absolute top-4 right-8 z-10">
        <CopyToClipboard
          text={generateLink() || ""}
          onCopy={() => {
            toast.success("Ссылка скопирована в буфер обмена")
          }}
        >
          <button
            type="button"
            className="bg-gray-100 hover:bg-gray-300 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg p-1.5 text-sm text-gray-900 hover:text-gray-900 flex items-center"
          >
            <FaShare className="h-5 w-5" />
          </button>
        </CopyToClipboard>
        <button
          type="button"
          className="top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 pointer-events-auto"
          onClick={onClose}
        >
          <X size={20} />
          <span className="sr-only">Закрыть окно</span>
        </button>
      </div>
      <div className="flex flex-col h-full">
        <ol className="relative border-l border-gray-200">
          {path &&
            getRouteDetailsByPath().map((detailsSlide, index) => (
              <li
                className="mb-10 ml-6 cursor-pointer group hover:bg-gray-50 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500"
                key={index}
                onClick={() => onDetailsSlideClick(detailsSlide)}
              >
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white group-focus:ring-blue-200 group-hover:ring-blue-200">
                  {detailsSlide.icon}
                </span>
                <p className="flex items-center mb-1 text-base font-normal text-gray-500">{detailsSlide.text}</p>
              </li>
            ))}
        </ol>
      </div>
    </div>
  )
}

export default RouteDetails
