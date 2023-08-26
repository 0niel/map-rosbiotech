import { useRouter } from "next/router"
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchState,
} from "react-zoom-pan-pinch"
import React, { useCallback, useEffect, useRef, useState } from "react"
import mapDataJson from "public/routes.json"
import MapRoute, { type MapRouteRef } from "./MapRoute"
import ScheduleAPI from "~/lib/schedule/api"
import { useQuery } from "react-query"
import { Spinner } from "flowbite-react"
import { RiRouteLine } from "react-icons/ri"
import { type RoomOnMap } from "~/lib/map/RoomOnMap"
import {
  fillRoom,
  getAllMapObjectsElements,
  getMapObjectIdByElement,
  getMapObjectTypeByElemet,
  mapObjectSelector,
  getMapObjectById,
} from "~/lib/map/domUtils"
import MapControls from "./MapControls"
import RoomDrawer from "./RoomDrawer"
import NavigationDialog from "./NavigationDialog"
import { useMapStore } from "~/lib/stores/mapStore"
import { MapObjectType, type MapObject } from "~/lib/map/MapObject"
import { MapData } from "~/lib/map/MapData"
import { useRouteStore } from "~/lib/stores/routeStore"
import RouteDetails, { type DetailsSlide } from "./RouteDetails"
import { useRoomsQuery } from "~/lib/hooks/useRoomsQuery"
import toast from "react-hot-toast"
import useScheduleDataStore from "~/lib/stores/scheduleDataStore"
import MapNavigationButtont from "./MapNavigationButton"

const scheduleAPI = new ScheduleAPI()

const loadJsonToGraph = (routesJson: string) => {
  return MapData.fromJson(routesJson)
}

const MapContainer = () => {
  const router = useRouter()
  const { campus, setFloor, floor, setMapData, mapData } = useMapStore()
  const { rooms, setRooms } = useScheduleDataStore()
  const { isLoading, error, data } = useRoomsQuery(campus.shortName, {
    onError: (e) => toast.error("Ошибка при загрузке информации о кабинетах из расписания"),
    onSuccess: (data) => {
      setRooms(data)
    },
    enabled: rooms.length === 0,
  })

  useEffect(() => {
    const mapData = loadJsonToGraph(JSON.stringify(mapDataJson))
    setMapData(mapData)
  }, [setMapData])

  const mapRouteRef = useRef<MapRouteRef>(null)

  const [drawerOpened, setDrawerOpened] = useState(false)

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)

  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(null)
  const selectedRoomOnMapRef = useRef<RoomOnMap | null>(null)
  useEffect(() => {
    selectedRoomOnMapRef.current = selectedRoomOnMap
  }, [selectedRoomOnMap])

  const isPanningRef = useRef<{ isPanning: boolean; prevEvent: MouseEvent | null }>({
    isPanning: false,
    prevEvent: null,
  })

  useEffect(() => {
    if (!isLoading && transformComponentRef.current) {
      if (!router.query.room) {
        return
      }

      // TODO: открытие комнаты по id
    }
  }, [isLoading, router.query.room])

  const selectRoomEl = useCallback(
    (room: Element) => {
      // Если это элемент уже выбран
      if (room === selectedRoomOnMapRef.current?.element) return

      // Если выбран другой объект, то возвращаем старый в исходное состояние
      if (selectedRoomOnMapRef.current && selectedRoomOnMapRef.current.baseElement) {
        selectedRoomOnMapRef.current.element.replaceWith(selectedRoomOnMapRef.current.baseElement)
      }

      const base = room.cloneNode(true)
      const baseState = base as Element

      fillRoom(room, "#2563EB")

      const mapObject = mapData?.objects.find((object) => object.id === getMapObjectIdByElement(room))
      if (!mapObject) {
        return
      }

      if (!data) {
        return
      }

      transformComponentRef.current?.zoomToElement(room as HTMLElement)

      const remote = data.find((room) => room.name === mapObject.name)

      setSelectedRoomOnMap({
        element: room,
        baseElement: baseState,
        name: mapObject.name,
        remote: remote || null,
        mapObject: mapObject,
      })

      setDrawerOpened(true)
    },
    [data, mapData?.objects],
  )

  const unselectRoomEl = useCallback(() => {
    if (selectedRoomOnMapRef.current && selectedRoomOnMapRef.current.baseElement) {
      selectedRoomOnMapRef.current.element.replaceWith(selectedRoomOnMapRef.current.baseElement)
    }

    setSelectedRoomOnMap(null)
  }, [])

  const handleRoomClick = useCallback(
    (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement
      let room = target.closest(mapObjectSelector)
      if (getMapObjectIdByElement(room?.parentElement as Element) === getMapObjectIdByElement(room as Element)) {
        room = room?.parentElement as Element
      }

      if (!room) {
        return
      }

      selectRoomEl(room)
    },
    [selectRoomEl],
  )

  useEffect(() => {
    // Сбрасываем выбранный объект
    unselectRoomEl()

    // Сбрасываем маршрут
    mapRouteRef?.current?.clearRoute()
  }, [campus, setFloor, unselectRoomEl])

  useEffect(() => {
    const currentScreenWidth = window.innerWidth
    const isSmallScreen = currentScreenWidth < 1024

    transformComponentRef.current?.setTransform(
      isSmallScreen ? campus.initialPositionX ?? 0 * 2 : campus.initialPositionX ?? 0,
      campus.initialPositionY ?? 0,
      campus.initialScale ?? 1,
      undefined,
    )
  }, [campus])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpened(false)
    unselectRoomEl()
  }, [unselectRoomEl])

  const [routesModalShow, setRoutesModalShow] = useState(false)

  const [routeStartAndEnd, setRouteStartAndEnd] = useState<{
    start: MapObject | null
    end: MapObject | null
    render: boolean
  }>(() => ({
    start: null,
    end: null,
    render: false,
  }))

  const { setStartMapObject, setEndMapObject } = useRouteStore()

  useEffect(() => {
    if (!routeStartAndEnd) {
      return
    }

    const { start, end } = routeStartAndEnd

    setStartMapObject(start)
    setEndMapObject(end)

    if (!start || !end) {
      return
    }

    if (routeStartAndEnd.render) {
      mapRouteRef.current?.renderRoute(start, end, floor)
    }
  }, [routeStartAndEnd, floor, setStartMapObject, setEndMapObject])

  const handlePanningStop = useCallback(
    (ref: ReactZoomPanPinchRef, event: TouchEvent | MouseEvent) => {
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

      isPanningRef.current = { isPanning: false, prevEvent: null }
    },
    [handleRoomClick],
  )

  const zoomToMapObject = useCallback(
    (mapObject: MapObject) => {
      const id = mapObject.id

      if (!mapData) return

      const mapObjectFloor = mapData.getObjectFloorByMapObjectId(id)
      if (mapObjectFloor !== floor && mapObjectFloor !== undefined) {
        setFloor(mapObjectFloor)
        setTimeout(() => {
          const element = getMapObjectById(id)
          if (element) {
            transformComponentRef.current?.zoomToElement(element as HTMLElement)
          }
        }, 0)
      } else {
        const element = getMapObjectById(id)
        if (element) {
          transformComponentRef.current?.zoomToElement(element as HTMLElement)
        }
      }
    },
    [floor, mapData, setFloor],
  )

  const [displayDetails, setDisplayDetails] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="h-full rounded-lg dark:border-gray-700">
        {selectedRoomOnMap && selectedRoomOnMap.mapObject && (
          <RoomDrawer
            isOpen={drawerOpened}
            onClose={handleCloseDrawer}
            room={selectedRoomOnMap?.remote || null}
            scheduleAPI={scheduleAPI}
            roomMapObject={selectedRoomOnMap.mapObject}
            onClickNavigateFromHere={(mapObject) => {
              setRouteStartAndEnd({ start: mapObject, end: routeStartAndEnd.end, render: false })
              setRoutesModalShow(true)
              setDrawerOpened(false)
            }}
            onClickNavigateToHere={(mapObject) => {
              setRouteStartAndEnd({ start: routeStartAndEnd.start, end: mapObject, render: false })
              setRoutesModalShow(true)
              setDrawerOpened(false)
            }}
            findNearestObject={(mapObjectType: MapObjectType, mapObjectNames: string[]) => {
              if (!selectedRoomOnMap.mapObject) return

              const mapObject = mapData?.getNearestMapObjectByType(
                selectedRoomOnMap.mapObject,
                mapObjectType,
                mapObjectNames,
              )

              if (!mapObject) return

              // Маршрут
              mapRouteRef.current?.renderRoute(selectedRoomOnMap.mapObject, mapObject, floor)
              setDrawerOpened(false)
            }}
          />
        )}

        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <Spinner />
          </div>
        )}

        {!isLoading && data && mapData && (
          <div className="relative z-0 mb-4 h-full w-full overflow-hidden">
            <NavigationDialog
              isOpen={routesModalShow}
              onClose={() => setRoutesModalShow(false)}
              onSelect={(start?: MapObject | null, end?: MapObject | null) => {
                if (start) {
                  setRouteStartAndEnd({ start: start, end: routeStartAndEnd.end, render: false })
                } else if (end) {
                  setRouteStartAndEnd({ start: routeStartAndEnd.start, end: end, render: false })
                }
              }}
              onSubmit={(start: MapObject, end: MapObject) => {
                setRoutesModalShow(false)
                setRouteStartAndEnd({ start, end, render: true })

                mapRouteRef.current?.renderRoute(start, end, floor)
              }}
              startMapObject={routeStartAndEnd.start}
              endMapObject={routeStartAndEnd.end}
            />

            <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between px-4 py-2 md:px-8 md:py-4">
              <MapNavigationButtont
                onClick={() => setRoutesModalShow(true)}
                onClickShowDetails={() => {
                  setDisplayDetails(true)
                }}
                onClickStart={() => {
                  if (!routeStartAndEnd.start) return

                  zoomToMapObject(routeStartAndEnd.start)
                }}
                onClickEnd={() => {
                  if (!routeStartAndEnd.end) return

                  zoomToMapObject(routeStartAndEnd.end)
                }}
              />

              <div className="z-30 sm:fixed sm:right-5 sm:bottom-5 fixed bottom-0 right-0 transform -translate-x-1/2 -translate-y-1/2 sm:translate-x-0 sm:translate-y-0">
                <MapControls
                  onZoomIn={() => transformComponentRef.current?.zoomIn()}
                  onZoomOut={() => transformComponentRef.current?.zoomOut()}
                  floors={campus.floors}
                />
              </div>

              {displayDetails && (
                <div className="z-10 fixed bottom-24">
                  <RouteDetails
                    onDetailsSlideChange={function (detailsSlide: DetailsSlide): void {
                      if (!detailsSlide.mapObjectToZoom) return
                      zoomToMapObject(detailsSlide.mapObjectToZoom)
                    }}
                    onDetailsSlideClick={function (detailsSlide: DetailsSlide): void {
                      if (!detailsSlide.mapObjectToZoom) return
                      zoomToMapObject(detailsSlide.mapObjectToZoom)
                    }}
                    onClose={function (): void {
                      setDisplayDetails(false)
                    }}
                  />
                </div>
              )}
            </div>

            <TransformWrapper
              minScale={0.05}
              initialScale={campus?.initialScale ?? 1}
              initialPositionX={campus?.initialPositionX ?? 0}
              initialPositionY={campus?.initialPositionY ?? 0}
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
                isPanningRef.current = { isPanning: true, prevEvent: event as MouseEvent }
              }}
              onPanningStop={handlePanningStop}
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
                {React.createElement(campus.map ?? "div")}
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapContainer
