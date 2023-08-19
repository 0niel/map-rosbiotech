/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "next/router"
import { type ReactZoomPanPinchRef, TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import React, { useEffect, useRef, useState } from "react"
import routesJson from "public/routes.json"
import { type Graph } from "~/lib/graph"
import MapRoute, { type MapRouteRef } from "./MapRoute"
import ScheduleAPI from "~/lib/schedule/api"
import { useQuery } from "react-query"
import { Spinner } from "flowbite-react"
import { MapPin } from "lucide-react"
import { type RoomOnMap } from "~/lib/map/RoomOnMap"
import {
  fillRoom,
  getAllMapObjectsElements,
  getMapObjectNameByElement,
  mapObjectSelector,
  searchMapObjectsByName,
} from "~/lib/map/roomHelpers"
import { searchInMapAndGraph } from "~/lib/map/searchInMapInGraph"
import MapControls from "./MapControls"
import RoomDrawer from "./RoomDrawer"
import RoutesModal from "./RoutesModal"
import { type SearchResult } from "../SearchInput"
import campuses from "~/lib/campuses"
import { useMapStore } from "~/lib/stores/map"

const scheduleAPI = new ScheduleAPI()

const loadJsonToGraph = (routesJson: string) => {
  return JSON.parse(routesJson) as Graph
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

  const [graph, setGraph] = useState<Graph>(loadJsonToGraph(JSON.stringify(routesJson)))

  const mapRouteRef = useRef<MapRouteRef>(null)

  const [drawerOpened, setDrawerOpened] = useState(false)

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null)
  const [selectedFloor, setSelectedFloor] = useState(3)
  const mapStore = useMapStore()

  const [selectedRoomOnMap, setSelectedRoomOnMap] = useState<RoomOnMap | null>(null)
  const selectedRoomRef = useRef<RoomOnMap | null>(null)

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
    if (selectedRoomRef.current && selectedRoomRef.current.baseElement) {
      selectedRoomRef.current.element.replaceWith(selectedRoomRef.current.baseElement)
    }

    if (room === selectedRoomRef.current?.element) {
      return
    }

    const base = room.cloneNode(true)
    base.addEventListener("click", handleRoomClick)
    ;(room as HTMLElement).style.cursor = "pointer"
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
    if (selectedRoomRef.current && selectedRoomRef.current.baseElement) {
      selectedRoomRef.current.element.replaceWith(selectedRoomRef.current.baseElement)
    }

    setSelectedRoomOnMap(null)
    setDrawerOpened(false)
  }

  const handleRoomClick = (e: Event) => {
    e.stopPropagation()
    e.preventDefault()

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

  useEffect(() => {
    selectedRoomRef.current = selectedRoomOnMap
  }, [selectedRoomOnMap])

  const [campusMap, setCampusMap] = useState(campuses.find((campus) => campus.label === "В-78"))

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

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSearch = (data: string) => {
    const results = searchInMapAndGraph(data, graph)
    setSearchResults(results)
  }

  const [selectedDateTime, setSelectedDateTime] = useState<Date>(new Date())

  const [routesModalShow, setRoutesModalShow] = useState(false)

  const mapImageRef = useRef<HTMLImageElement>(null)

  const mapCliclableRegions = () => {
    const roomsElements = getAllMapObjectsElements(document)

    roomsElements.forEach((room) => {
      ;(room as HTMLElement).style.cursor = "pointer"
      room.addEventListener("click", handleRoomClick)
    })
  }

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
              onSubmit={(start: string, end: string) => {
                setRoutesModalShow(false)

                mapRouteRef.current?.renderRoute(start, end)
              }}
              aviableRooms={graph.vertices.map((v) => v.label ?? "").filter((v) => v !== "")}
            />

            <div className="pointer-events-none fixed bottom-0 z-10 flex w-full flex-row items-end justify-between px-4 py-2 md:px-8 md:py-4">
              {/* Кнопка маршрута снизу слева */}
              <button
                className="pointer-events-auto flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4"
                onClick={() => {
                  setRoutesModalShow(true)
                }}
              >
                <MapPin className="h-6 w-6" />
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
              panning={{ disabled: false, velocityDisabled: true }}
              wheel={{ disabled: false, step: 0.05 }}
              pinch={{ step: 0.05 }}
              zoomAnimation={{ disabled: true }}
              ref={transformComponentRef}
              smooth={true}
              alignmentAnimation={{ disabled: true }}
              velocityAnimation={{ disabled: true, sensitivity: 0 }}
              limitToBounds={false}
              centerZoomedOut={false}
              // centerOnInit={true}
              disablePadding={false}

              // onTransformed={(ref, event) => {
              //   console.log(ref.state);
              // }}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
              >
                <MapRoute ref={mapRouteRef} className="pointer-events-none absolute z-20 h-full w-full" graph={graph} />
                {React.createElement(campusMap?.map ?? "div", {
                  floor: selectedFloor,
                  onLoaded: () => mapCliclableRegions(),
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
