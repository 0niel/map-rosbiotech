import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Edge, type Vertex } from '@/lib/map/Graph'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import { useRouteStore } from '@/lib/stores/routeStore'
import { Route } from 'lucide-react'
import { useCallback } from 'react'
import { BiWalk } from 'react-icons/bi'
import { TbStairsDown, TbStairsUp } from 'react-icons/tb'
import { toast } from 'sonner'
interface RouteDetailsProps {
  onDetailsSlideChange: (detailsSlide: DetailsSlide) => void
  onDetailsSlideClick: (detailsSlide: DetailsSlide) => void
}

export interface DetailsSlide {
  floor: number
  mapObjectToZoom?: MapObject
  text: string
  icon?: React.ReactNode
  distance?: string
  time?: string
}

const WaypointsIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="4.5" r="2.5" />
    <path d="m10.2 6.3-3.9 3.9" />
    <circle cx="4.5" cy="12" r="2.5" />
    <path d="M7 12h10" />
    <circle cx="19.5" cy="12" r="2.5" />
    <path d="m13.8 17.7 3.9-3.9" />
    <circle cx="12" cy="19.5" r="2.5" />
  </svg>
)

// Константа для конвертации веса рёбер в метры
const WEIGHT_TO_METERS_COEFFICIENT = 0.2

const RouteDetails: React.FC<RouteDetailsProps> = ({ onDetailsSlideClick }) => {
  const { path } = useRouteStore()
  const { mapData } = useMapStore()

  const generateLink = () => {
    if (!path) {
      toast.error('Не удалось сгенерировать ссылку на маршрут')
      return ''
    }

    const start = path.at(0)?.at(0)?.mapObjectId
    const endSegment = path.at(path.length - 1)
    const end = endSegment?.at(endSegment.length - 1)?.mapObjectId

    if (!start || !end) {
      toast.error('Не удалось сгенерировать ссылку на маршрут')
      return ''
    }

    return `${window.location.origin}/?start=${start}&end=${end}`
  }

  const findEdgeBetweenVertices = (
    floor: number,
    vertex1: Vertex,
    vertex2: Vertex
  ): Edge | undefined => {
    const graph = mapData?.floors[floor]
    if (!graph) return undefined

    return graph.edges.find(
      edge =>
        (edge.source === vertex1.id && edge.target === vertex2.id) ||
        (edge.source === vertex2.id && edge.target === vertex1.id)
    )
  }

  const calculateDistanceAndTime = (
    floor: number,
    vertices: Vertex[]
  ): { distance: string; time: string } => {
    let totalDistance = 0

    for (let i = 0; i < vertices.length - 1; i++) {
      const currentVertex = vertices[i]
      const nextVertex = vertices[i + 1]

      if (currentVertex && nextVertex) {
        const edge = findEdgeBetweenVertices(floor, currentVertex, nextVertex)
        if (edge) {
          totalDistance += edge.weight
        }
      }
    }

    totalDistance = totalDistance * WEIGHT_TO_METERS_COEFFICIENT
    totalDistance = Math.round(totalDistance)

    const time = Math.round(totalDistance / 60) // Примерный расчёт времени (1 минута на каждые ~60 метров)
    return {
      distance: `${totalDistance} метров`,
      time: `${time} минут`
    }
  }

  const getRouteDetailsByPath = useCallback((): DetailsSlide[] => {
    const routeDetails: DetailsSlide[] = []

    if (!path || !mapData) {
      return []
    }

    const firstSegment = path[0] || []
    const lastSegment = path[path.length - 1] || []
    const firstPoint = firstSegment[0]
    const lastPoint = lastSegment[lastSegment.length - 1]

    if (!firstPoint || !lastPoint) return []

    routeDetails.push({
      floor: mapData.getFloorByPoint(firstPoint),
      mapObjectToZoom: mapData.getMapObjectById(firstPoint.mapObjectId || ''),
      text: 'Начало маршрута',
      icon: (
        <div className="flex h-4 w-4 items-center justify-center rounded-full font-medium text-primary">
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
        const { distance, time } = calculateDistanceAndTime(floor, pathSegment)
        routeDetails.push({
          floor,
          text: `Маршрут по этажу ${floor}`,
          icon: <BiWalk className="h-4 w-4 text-primary" />,
          distance,
          time
        })
      }

      const nextSegment = path[i + 1]
      const currentSegmentFloor = mapData.getFloorByPoint(pathSegment[0])

      const lastVertex = pathSegment[pathSegment.length - 1]
      if (lastVertex) {
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
            const { distance, time } = calculateDistanceAndTime(
              nextFloor,
              nextSegment
            )

            if (nextFloor > currentSegmentFloor) {
              routeDetails.push({
                floor: nextFloor,
                mapObjectToZoom: mapData.getMapObjectById(
                  nextSegment[0].mapObjectId || ''
                ),
                text: `Подъём на этаж ${nextFloor}`,
                icon: <TbStairsUp className="h-4 w-4 text-primary" />,
                distance,
                time
              })
            } else if (nextFloor < currentSegmentFloor) {
              routeDetails.push({
                floor: nextFloor,
                mapObjectToZoom: mapData.getMapObjectById(
                  nextSegment[0].mapObjectId || ''
                ),
                text: `Спуск на этаж ${nextFloor}`,
                icon: <TbStairsDown className="h-4 w-4 text-primary" />,
                distance,
                time
              })
            }
          }
        }
      }
    }

    const lastFloor = mapData.getFloorByPoint(lastPoint)
    const { distance, time } = calculateDistanceAndTime(lastFloor, lastSegment)
    routeDetails.push({
      floor: lastFloor,
      mapObjectToZoom: mapData.getMapObjectById(lastPoint.mapObjectId || ''),
      text: 'Конец маршрута',
      icon: (
        <div className="flex h-4 w-4 items-center justify-center rounded-full font-medium text-primary">
          Б
        </div>
      ),
      distance,
      time
    })

    return routeDetails
  }, [mapData, path])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Route className="h-5 w-5" />
          <span className="sr-only">Открыть навигацию</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col gap-6">
          <div>
            <DialogTitle>Детали маршрута</DialogTitle>
            <DialogDescription>Подробности вашего маршрута.</DialogDescription>
          </div>
          <div className="relative">
            <ol className="grid gap-4">
              {path &&
                getRouteDetailsByPath().map((detailsSlide, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[25px_1fr] items-start gap-4"
                  >
                    <span className="flex items-center justify-center rounded-full bg-gray-200 p-1">
                      {detailsSlide.icon}
                    </span>
                    <div>
                      <p className="font-medium">{detailsSlide.text}</p>
                      {detailsSlide.distance && detailsSlide.time && (
                        <p className="text-muted-foreground">
                          Расстояние: {detailsSlide.distance}, Время:{' '}
                          {detailsSlide.time}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default RouteDetails
