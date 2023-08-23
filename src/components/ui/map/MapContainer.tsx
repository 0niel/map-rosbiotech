import { useRouter } from "next/router"
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchState,
} from "react-zoom-pan-pinch"
import React, { useCallback, useEffect, useRef, useState } from "react"
import mapDataJson from "public/routes.json"
import { getSearchebleObjects, type MapData } from "~/lib/graph"
import MapRoute, { type MapRouteRef } from "./MapRoute"
import ScheduleAPI from "~/lib/schedule/api"
import { useQuery } from "react-query"
import { Spinner } from "flowbite-react"
import { RiRouteLine } from "react-icons/ri"
import { type RoomOnMap } from "~/lib/map/RoomOnMap"
import {
  fillRoom,
  getAllMapObjectsElements,
  getMapObjectNameByElement,
  getMapObjectTypeByElemet,
  mapObjectSelector,
  searchMapObjectsByName,
} from "~/lib/map/mapObjectsDOM"
import MapControls from "./MapControls"
import RoomDrawer from "./RoomDrawer"
import RoutesModal from "./RoutesModal"
import campuses from "~/lib/campuses"
import { useMapStore } from "~/lib/stores/map"
import { MapObjectType, type MapObject } from "~/lib/map/MapObject"
import Image from "next/image"

const scheduleAPI = new ScheduleAPI()

const loadJsonToGraph = (routesJson: string) => {
  return JSON.parse(routesJson) as MapData
}

const MapContainer = () => {
  const router = useRouter()

  const { isLoading, error, data } = useQuery(["rooms"], {
    queryFn: async () => {
      const campuses = await scheduleAPI.getCampuses()

      const campusId = campuses.find((campus) => campus.short_name === mapStore.campus)?.id

      if (!campusId) {
        return null
      }

      const rooms = await scheduleAPI.getRooms(campusId)

      return rooms
    },
    onError: (error) => {
      console.error(error)
    },
  })

  const [mapData, setMapData] = useState<MapData>(loadJsonToGraph(JSON.stringify(mapDataJson)))

  const mapRouteRef = useRef<MapRouteRef>(null)

  const [drawerOpened, setDrawerOpened] = useState(false)

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [selectedFloor, setSelectedFloor] = useState(2)
  const mapStore = useMapStore()

  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(null)
  const selectedRoomOnMapRef = useRef<RoomOnMap | null>(null)
  useEffect(() => {
    selectedRoomOnMapRef.current = selectedRoomOnMap
  }, [selectedRoomOnMap])

  const [isPanning, setIsPanning] = useState<{ isPanning: boolean; prevEvent: MouseEvent | null }>({
    isPanning: false,
    prevEvent: null,
  })
  const isPanningRef = useRef(isPanning)

  useEffect(() => {
    isPanningRef.current = isPanning
  }, [isPanning])

  useEffect(() => {
    if (!isLoading && transformComponentRef.current) {
      if (!router.query.room) {
        return
      }

      const room = searchMapObjectsByName(router.query.room as string)[0] as Element
      if (room) {
        selectRoomEl(room)
      }
    }
  }, [isLoading, transformComponentRef.current])

  const selectRoomEl = (room: Element) => {
    // Если это элемент уже выбран
    if (room === selectedRoomOnMapRef.current?.element) return

    // Если выбран другой объект, то возвращаем старый в исходное состояние
    if (selectedRoomOnMapRef.current && selectedRoomOnMapRef.current.baseElement) {
      selectedRoomOnMapRef.current.element.replaceWith(selectedRoomOnMapRef.current.baseElement)
    }

    const base = room.cloneNode(true)
    base.addEventListener("click", (e: Event) => {
      handleRoomClick(e)
    })

    const baseState = base as Element

    fillRoom(room, "#2563EB")

    const name = getMapObjectNameByElement(room)
    if (!name) {
      return
    }

    if (!data) {
      return
    }

    transformComponentRef.current?.zoomToElement(room as HTMLElement)

    const remote = data.find((room) => room.name === name)

    setSelectedRoomOnMap({
      element: room,
      baseElement: baseState,
      name: name,
      remote: remote || null,
    })

    setDrawerOpened(true)
  }

  const unselectRoomEl = () => {
    if (selectedRoomOnMapRef.current && selectedRoomOnMapRef.current.baseElement) {
      selectedRoomOnMapRef.current.element.replaceWith(selectedRoomOnMapRef.current.baseElement)
    }

    setSelectedRoomOnMap(null)
  }

  const handleRoomClick = (e: Event) => {
    e.preventDefault()
    e.stopPropagation()

    const target = e.target as HTMLElement
    let room = target.closest(mapObjectSelector)
    if (getMapObjectNameByElement(room?.parentElement as Element) === getMapObjectNameByElement(room as Element)) {
      room = room?.parentElement as Element
    }

    if (!room) {
      return
    }

    selectRoomEl(room)
  }

  const [campusMap, setCampusMap] = useState(campuses.find((campus) => campus.label === "В-78"))

  useEffect(() => {
    setSelectedFloor(campusMap?.initialFloor ?? 2)

    // Сбрасываем выбранный объект
    unselectRoomEl()

    // Сбрасываем маршрут
    mapRouteRef?.current?.clearRoute()
  }, [campusMap])

  useEffect(() => {
    const map = campuses.find((campus) => campus.label === mapStore.campus)

    const currentScreenWidth = window.innerWidth
    const isSmallScreen = currentScreenWidth < 1024

    transformComponentRef.current?.setTransform(
      isSmallScreen ? map?.initialPositionX ?? 0 * 2 : map?.initialPositionX ?? 0,
      map?.initialPositionY ?? 0,
      map?.initialScale ?? 1,
      undefined,
    )
    setCampusMap(map)
  }, [mapStore.campus])

  const handleCloseDrawer = () => {
    setDrawerOpened(false)
    unselectRoomEl()
  }

  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date())

  const [routesModalShow, setRoutesModalShow] = useState(false)

  const [routeStartAndEnd, setRouteStartAndEnd] = useState<{ start: MapObject; end: MapObject } | null>(null)

  useEffect(() => {
    if (!routeStartAndEnd) {
      return
    }

    const { start, end } = routeStartAndEnd

    if (!start || !end) {
      return
    }

    mapRouteRef.current?.renderRoute(start, end, selectedFloor)
  }, [routeStartAndEnd, selectedFloor])

  const [prevPanZoomState, setPrevPanZoomState] = useState<ReactZoomPanPinchState | null>(null)
  const prevPanZoomStateRef = useRef<ReactZoomPanPinchState | null>(null)
  useEffect(() => {
    prevPanZoomStateRef.current = prevPanZoomState
  }, [prevPanZoomState])

  useEffect(() => {
    if (isPanning.isPanning) {
      document.body.style.cursor = "grabbing"
    } else {
      document.body.style.cursor = "default"
    }
  }, [isPanning])

  return (
    <div className="flex h-full flex-col">
      <div className="h-full rounded-lg dark:border-gray-700">
        <RoomDrawer
          isOpen={drawerOpened}
          onClose={handleCloseDrawer}
          room={selectedRoomOnMap?.remote || null}
          dateTime={selectedDateTime}
          scheduleAPI={scheduleAPI}
        />

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!isLoading && data && (
          <div className="relative z-0 mb-4 h-full w-full overflow-hidden">
            <RoutesModal
              isOpen={routesModalShow}
              onClose={() => setRoutesModalShow(false)}
              onSubmit={(start: MapObject, end: MapObject) => {
                setRoutesModalShow(false)

                setRouteStartAndEnd({ start, end })

                mapRouteRef.current?.renderRoute(start, end, selectedFloor)
              }}
              aviableMapObjects={getSearchebleObjects(mapData)}
              mapData={mapData}
            />

            <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between px-4 py-2 md:px-8 md:py-4">
              {/* Кнопка маршрута снизу слева */}
              <button
                className="pointer-events-auto flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4"
                onClick={() => {
                  setRoutesModalShow(true)
                }}
              >
                <Image className="h-6 w-6" src="/icons/route.svg" alt="Маршрут" width={24} height={24} />
              </button>

              <div className="z-30 md:fixed md:right-10">
                <MapControls
                  onZoomIn={() => transformComponentRef.current?.zoomIn()}
                  onZoomOut={() => transformComponentRef.current?.zoomOut()}
                  floors={campuses.find((c) => c.label === mapStore.campus)?.floors || []}
                  selectedFloor={selectedFloor}
                  setSelectedFloor={setSelectedFloor}
                />
              </div>
            </div>

            <TransformWrapper
              minScale={0.05}
              initialScale={campusMap?.initialScale ?? 1}
              initialPositionX={campusMap?.initialPositionX ?? 0}
              initialPositionY={campusMap?.initialPositionY ?? 0}
              maxScale={1}
              panning={{ disabled: false, velocityDisabled: false }}
              velocityAnimation={{
                sensitivity: 1,
                animationTime: 100,
                animationType: "linear",
                equalToMove: true,
              }}
              ref={transformComponentRef}
              smooth={true}
              limitToBounds={false}
              centerZoomedOut={false}
              disablePadding={false}
              onPanningStart={(ref, event) => {
                setIsPanning({ isPanning: true, prevEvent: event as MouseEvent })
              }}
              onPanningStop={(ref, event) => {
                // Нужно, чтобы при перетаскивании не срабатывал клик
                if (isPanningRef.current.prevEvent) {
                  const timeDiff = event?.timeStamp - isPanningRef.current.prevEvent?.timeStamp
                  if (timeDiff < 200) {
                    const { clientX, clientY } = isPanningRef.current.prevEvent

                    const element = document.elementFromPoint(clientX, clientY)
                    const elementWithMapObject = element?.closest(mapObjectSelector)

                    const aviableToSelectMapObjectElements = getAllMapObjectsElements(document)

                    const mapObjectElement = aviableToSelectMapObjectElements.find((el) => el === elementWithMapObject)

                    if (mapObjectElement) {
                      const isCliclableType = getMapObjectTypeByElemet(mapObjectElement) === MapObjectType.ROOM
                      if (isCliclableType) {
                        handleRoomClick(isPanningRef.current.prevEvent)
                      }
                    }
                  }
                }

                setIsPanning({ isPanning: false, prevEvent: null })
              }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
              >
                <MapRoute
                  ref={mapRouteRef}
                  className="pointer-events-none absolute z-20 h-full w-full"
                  mapData={mapData}
                />
                {React.createElement(campusMap?.map ?? "div", {
                  floor: selectedFloor,
                  // onLoaded: () => {},
                })}
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapContainer
