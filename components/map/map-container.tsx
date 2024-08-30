'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import MapWrapper from '../svg-maps/MapWrapper'
import MapControls from './map-controls'
import MapNavigationButton from './navigation-button'
import MapRoute, { type MapRouteRef } from './MapRoute'
import NavigationDialog from './navigation-dialog'
import RoomDrawer from './room-drawer'
import campuses from '@/lib/campuses'
import { MapData } from '@/lib/map/MapData'
import { type MapObject, MapObjectType } from '@/lib/map/MapObject'
import { type RoomOnMap } from '@/lib/map/RoomOnMap'
import {
  fillRoom,
  getAllMapObjectsElements,
  getMapObjectElementByIdAsync,
  getMapObjectIdByElement,
  getMapObjectTypeByElemet,
  mapObjectSelector
} from '@/lib/map/domUtils'
import { useDisplayModeStore } from '@/lib/stores/displayModeStore'
import { useMapStore } from '@/lib/stores/mapStore'
import { useRouteStore } from '@/lib/stores/routeStore'
import mapDataJson from '@/public/routes.json'
import { toast } from 'sonner'
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper
} from 'react-zoom-pan-pinch'

const loadJsonToGraph = (routesJson: string) => {
  return MapData.fromJson(routesJson)
}

const MapContainer = () => {
  const searchParams = useSearchParams()
  const {
    campus,
    building,
    setFloor,
    floor,
    setMapData,
    mapData,
    selectedFromSearchRoom,
    setSelectedFromSearchRoom,
    setCampus
  } = useMapStore()

  const { setTimeToDisplay } = useDisplayModeStore()

  useEffect(() => {
    const mapData = loadJsonToGraph(JSON.stringify(mapDataJson))
    setMapData(mapData)
  }, [setMapData])

  const mapRouteRef = useRef<MapRouteRef>(null)
  const { setStartMapObject, setEndMapObject } = useRouteStore()

  const [drawerOpened, setDrawerOpened] = useState(false)
  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(
    null
  )
  const selectedRoomOnMapRef = useRef<RoomOnMap | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    selectedRoomOnMapRef.current = selectedRoomOnMap
  }, [selectedRoomOnMap])

  const isPanningRef = useRef<{
    isPanning: boolean
    prevEvent: MouseEvent | null
  }>({
    isPanning: false,
    prevEvent: null
  })

  const zoomToMapObject = useCallback(
    (mapObject: MapObject, select: boolean = false) => {
      const id = mapObject.id

      if (!mapData) return

      const mapObjectFloor = mapData.getObjectFloorByMapObjectId(id)
      if (mapObjectFloor !== floor && mapObjectFloor !== undefined) {
        setFloor(mapObjectFloor)
      }
      void getMapObjectElementByIdAsync(id)
        .then(element => {
          transformComponentRef.current?.zoomToElement(element as HTMLElement)
          if (select) {
            selectRoomEl(element as HTMLElement)
          }
        })
        .catch(() => {
          toast.error('Не удалось найти объект на карте')
        })
    },
    [floor, mapData, setFloor]
  )

  const selectRoomEl = useCallback(
    (room: Element) => {
      if (room === selectedRoomOnMapRef.current?.element) return

      if (
        selectedRoomOnMapRef.current &&
        selectedRoomOnMapRef.current.baseElement
      ) {
        selectedRoomOnMapRef.current.element.replaceWith(
          selectedRoomOnMapRef.current.baseElement
        )
      }

      const base = room.cloneNode(true) as Element
      const mapObject = mapData?.objects.find(
        object => object.id === getMapObjectIdByElement(room)
      )
      if (!mapObject) {
        toast.error('Нет данных для этой карты')
        return
      }

      fillRoom(room, '#2563EB')
      transformComponentRef.current?.zoomToElement(room as HTMLElement)

      setSelectedRoomOnMap({
        element: room,
        baseElement: base,
        name: mapObject.name,
        mapObject,
        remote: null
      })

      setDrawerOpened(true)
    },
    [mapData?.objects]
  )

  const unselectRoomEl = useCallback(() => {
    if (
      selectedRoomOnMapRef.current &&
      selectedRoomOnMapRef.current.baseElement
    ) {
      selectedRoomOnMapRef.current.element.replaceWith(
        selectedRoomOnMapRef.current.baseElement
      )
    }

    setSelectedRoomOnMap(null)
  }, [])

  useEffect(() => {
    if (!transformComponentRef.current || !mapData) {
      return
    }

    const object = searchParams.get('object')
    if (object) {
      const mapObject = mapData.getMapObjectById(object)
      if (!mapObject) {
        toast.error('Не найден объект на карте по вашей ссылке')
        return
      }
      zoomToMapObject(mapObject, true)
      return
    }

    const start = searchParams.get('start')
    const end = searchParams.get('end')
    if (start && end) {
      const startMapObject = mapData.getMapObjectById(start)
      const endMapObject = mapData.getMapObjectById(end)

      if (!startMapObject || !endMapObject) {
        toast.error('Не удалось построить маршрут по вашей ссылке')
        return
      }

      setRouteStartAndEnd({
        start: startMapObject,
        end: endMapObject,
        render: true
      })
    }

    const c = searchParams.get('campus')
    const room = searchParams.get('room')
    const date = searchParams.get('date')
    if (room && campus && date) {
      if (c && c !== campus.shortName) {
        setCampus(campuses.find(campus => campus.shortName === c) ?? campus)
      }

      const mapObject = mapData.getObjectByName(room)
      if (!mapObject) {
        toast.error('Не удалось найти аудиторию на карте')
        return
      }

      zoomToMapObject(mapObject, true)
      setTimeToDisplay(new Date(date))
    }
  }, [
    searchParams,
    mapData,
    campus,
    setCampus,
    setTimeToDisplay,
    zoomToMapObject
  ])

  const handleRoomClick = useCallback(
    (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      const target = e.target as HTMLElement
      let room = target.closest(mapObjectSelector)
      if (
        getMapObjectIdByElement(room?.parentElement as Element) ===
        getMapObjectIdByElement(room as Element)
      ) {
        room = room?.parentElement as Element
      }

      if (!room) return

      selectRoomEl(room)
    },
    [selectRoomEl]
  )

  useEffect(() => {
    unselectRoomEl()
    mapRouteRef.current?.clearRoute()
  }, [campus, setFloor, unselectRoomEl])

  useEffect(() => {
    if (!selectedFromSearchRoom) return

    if (selectedFromSearchRoom.mapObject) {
      zoomToMapObject(selectedFromSearchRoom.mapObject, true)
      return
    }

    if (selectedFromSearchRoom.campus !== campus.shortName) {
      setCampus(
        campuses.find(
          campus => campus.shortName === selectedFromSearchRoom.campus
        ) ?? campus
      )
    }

    const mapObject = mapData?.getObjectByName(selectedFromSearchRoom.name)
    if (!mapObject) {
      toast.error('Не удалось найти аудиторию на карте')
      return
    }

    zoomToMapObject(mapObject, true)
    setSelectedFromSearchRoom(null)
  }, [
    selectedFromSearchRoom,
    campus,
    mapData,
    setCampus,
    setSelectedFromSearchRoom,
    zoomToMapObject
  ])

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpened(false)
    unselectRoomEl()
  }, [unselectRoomEl])

  const [navigationDialogOpen, setNavigationDialogOpen] = useState(false)
  const [routeStartAndEnd, setRouteStartAndEnd] = useState<{
    start: MapObject | null
    end: MapObject | null
    render: boolean
  }>({
    start: null,
    end: null,
    render: false
  })

  useEffect(() => {
    if (!routeStartAndEnd) return

    const { start, end } = routeStartAndEnd
    setStartMapObject(start)
    setEndMapObject(end)

    if (start && end && routeStartAndEnd.render) {
      mapRouteRef.current?.renderRoute(start, end, floor)
    }
  }, [routeStartAndEnd, floor, setStartMapObject, setEndMapObject])

  const handlePanningStop = useCallback(
    (ref: ReactZoomPanPinchRef, event: TouchEvent | MouseEvent) => {
      if (isPanningRef.current.prevEvent) {
        const timeDiff =
          event?.timeStamp - isPanningRef.current.prevEvent?.timeStamp
        if (timeDiff < 200) {
          const { clientX, clientY } = isPanningRef.current.prevEvent
          const element = document.elementFromPoint(clientX, clientY)
          const elementWithMapObject = element?.closest(mapObjectSelector)
          const mapObjectElement = getAllMapObjectsElements(document).find(
            el => el === elementWithMapObject
          )

          if (
            mapObjectElement &&
            getMapObjectTypeByElemet(mapObjectElement) === MapObjectType.ROOM
          ) {
            handleRoomClick(isPanningRef.current.prevEvent)
          }
        }
      }

      isPanningRef.current = { isPanning: false, prevEvent: null }
    },
    [handleRoomClick]
  )

  return (
    <div className="flex h-full flex-col">
      <div className="h-full rounded-lg dark:border-gray-700">
        {selectedRoomOnMap && selectedRoomOnMap.mapObject && (
          <RoomDrawer
            isOpen={drawerOpened}
            onClose={handleCloseDrawer}
            room={selectedRoomOnMap}
            onClickNavigateFromHere={mapObject => {
              setRouteStartAndEnd({
                start: mapObject,
                end: routeStartAndEnd.end,
                render: false
              })
              setNavigationDialogOpen(true)
              handleCloseDrawer()
            }}
            onClickNavigateToHere={mapObject => {
              setRouteStartAndEnd({
                start: routeStartAndEnd.start,
                end: mapObject,
                render: false
              })
              setNavigationDialogOpen(true)
              handleCloseDrawer()
            }}
            findNearestObject={(
              mapObjectType: MapObjectType,
              mapObjectNames: string[]
            ) => {
              if (!selectedRoomOnMap.mapObject) return

              const mapObject = mapData?.getNearestMapObjectByType(
                selectedRoomOnMap.mapObject,
                mapObjectType,
                mapObjectNames
              )

              if (!mapObject) return

              setRouteStartAndEnd({
                start: selectedRoomOnMap.mapObject,
                end: mapObject,
                render: true
              })
              handleCloseDrawer()
            }}
          />
        )}

        {mapData && (
          <div className="relative z-0 mb-4 h-full w-full overflow-hidden">
            <NavigationDialog
              isOpen={navigationDialogOpen}
              onClose={() => setNavigationDialogOpen(false)}
              onSelect={(start?: MapObject | null, end?: MapObject | null) => {
                if (start) {
                  setRouteStartAndEnd({
                    start,
                    end: routeStartAndEnd.end,
                    render: false
                  })
                } else if (end) {
                  setRouteStartAndEnd({
                    start: routeStartAndEnd.start,
                    end,
                    render: false
                  })
                }
              }}
              onSubmit={(start: MapObject, end: MapObject) => {
                setNavigationDialogOpen(false)
                setRouteStartAndEnd({
                  start,
                  end,
                  render: true
                })
                zoomToMapObject(start)
                mapRouteRef.current?.renderRoute(start, end, floor)
              }}
              startMapObject={routeStartAndEnd.start}
              endMapObject={routeStartAndEnd.end}
              setWaitForSelectStart={() => {
                setNavigationDialogOpen(false)
              }}
              setWaitForSelectEnd={() => {
                setNavigationDialogOpen(false)
              }}
            />

            <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between py-2 md:py-4">
              <MapNavigationButton
                onClickStart={() => {
                  if (!routeStartAndEnd.start) return

                  zoomToMapObject(routeStartAndEnd.start)
                }}
                onClickEnd={() => {
                  if (!routeStartAndEnd.end) return

                  zoomToMapObject(routeStartAndEnd.end)
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

            <TransformWrapper
              minScale={0.05}
              initialScale={campus?.initialScale ?? scale}
              initialPositionX={campus?.initialPositionX ?? 0}
              initialPositionY={campus?.initialPositionY ?? 0}
              maxScale={1}
              panning={{
                disabled: false,
                velocityDisabled: false
              }}
              velocityAnimation={{
                sensitivity: 1,
                animationTime: 100,
                animationType: 'linear',
                equalToMove: true
              }}
              ref={transformComponentRef}
              smooth
              limitToBounds={false}
              centerZoomedOut={false}
              disablePadding={false}
              onPanningStart={(ref, event) => {
                isPanningRef.current = {
                  isPanning: true,
                  prevEvent: event as MouseEvent
                }
              }}
              onPanningStop={handlePanningStop}
            >
              <TransformComponent
                wrapperStyle={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute'
                }}
              >
                <MapRoute
                  ref={mapRouteRef}
                  className="pointer-events-none absolute z-20 h-full w-full"
                  mapData={mapData}
                />
                <MapWrapper transformComponentRef={transformComponentRef} />
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapContainer
