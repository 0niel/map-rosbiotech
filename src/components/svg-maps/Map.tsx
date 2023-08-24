import { useEffect } from "react"
import { useQuery } from "react-query"
import Spinner from "~/components/ui/Spinner"
import { Dialog } from "@headlessui/react"
import { fetchSvg } from "./fetchSvg"
import { type MapProps } from "./MapProps"
import { useDisplayModeStore } from "~/lib/stores/displayMode"
import ScheduleAPI from "~/lib/schedule/api"
import { useMapStore } from "~/lib/stores/map"
import { type components } from "~/lib/schedule/schema"
import { MapDisplayMode } from "./MapDisplayMode"
import { fillRoom, getAllMapObjectsElements, getMapObjectById } from "~/lib/map/domUtils"
import { type MapData } from "~/lib/map/MapData"
import { MapObjectType } from "~/lib/map/MapObject"

const unactiveGray = "hsl(0, 0%, 80%)"

const createHeatMap = (
  svg: SVGElement,
  workload: { id: number; workload: number }[],
  rooms: components["schemas"]["Room"][],
  mapData: MapData,
) => {
  for (const mapObjEl of getAllMapObjectsElements()) {
    fillRoom(mapObjEl, unactiveGray)
  }

  for (const room of rooms) {
    const roomMapObject = mapData.objects.find((object) => object.name === room.name)
    if (!roomMapObject) {
      continue
    }

    const mapObject = getMapObjectById(roomMapObject.id)
    if (!mapObject) {
      continue
    }

    const roomWorkload = workload.find((workload) => workload.id === room.id)?.workload
    if (!roomWorkload) {
      continue
    }

    // roomWorkload - 0..100, 0 - свободно, 100 - занято
    const red = Math.round((roomWorkload / 100) * 255)
    const green = Math.round(((100 - roomWorkload) / 100) * 165)

    const color = `rgb(${red}, ${green}, 0)`

    fillRoom(mapObject, color)
  }

  return svg
}

const scheduleAPI = new ScheduleAPI()

const Map = ({ floor, onLoaded, svgUrl, mapData }: MapProps) => {
  const displayModeStore = useDisplayModeStore()
  const mapStore = useMapStore()

  const { isLoading, data, refetch, status } = useQuery(["map", svgUrl, displayModeStore.mode], {
    queryFn: async () => {
      return await fetchSvg(svgUrl)
    },
    onError: (error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    void refetch().then(() => {
      if (displayModeStore.mode !== MapDisplayMode.DEFAULT || !data) {
        return
      }

      const svgElement = document.querySelector("#map svg") as SVGElement
      svgElement.innerHTML = data
    })
  }, [displayModeStore.mode])

  const { isLoading: roomsIsLoading, data: roomsData } = useQuery<components["schemas"]["Room"][], Error>(
    ["rooms", mapStore.campus],
    {
      queryFn: async () => {
        const { data, error } = await scheduleAPI.getCampuses()
        if (error || !data) throw error

        const currentCampusId = data.find((campus) => campus.short_name === mapStore.campus)?.id
        if (!currentCampusId) throw new Error("Кампус не найден")

        const { data: rooms, error: roomsError } = await scheduleAPI.getRooms(currentCampusId)
        if (roomsError || !rooms) throw roomsError

        return rooms
      },
      onError: (error) => {
        console.error(error)
      },
    },
  )

  const {
    isLoading: roomsWorkloadIsLoading,
    data: roomsWorkloadData,
    refetch: refetchWorkload,
  } = useQuery(["roomsWorkload", roomsData], {
    queryFn: async () => {
      if (!roomsData) throw new Error("Нет данных о кабинетах")
      const room = roomsData[0] as components["schemas"]["Room"]
      const { data, error } = await scheduleAPI.getRoomsWorkload(room.campus?.id || 0)
      if (error || !data) throw error

      return data as { id: number; workload: number }[]
    },
    onError: (error) => {
      console.error(error)
    },
    enabled: roomsData !== undefined && roomsData.length > 0 && displayModeStore.mode === MapDisplayMode.HEATMAP,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data && roomsWorkloadData && displayModeStore.mode === MapDisplayMode.HEATMAP && mapData && roomsData) {
      const svgElement = document.querySelector("#map svg") as SVGElement
      createHeatMap(svgElement, roomsWorkloadData, roomsData, mapData)
    }
  }, [data, displayModeStore.mode, mapData, roomsData, roomsWorkloadData])

  useEffect(() => {
    console.log(status)
  }, [status, data])

  return (
    <>
      <Dialog open={isLoading || roomsIsLoading || roomsWorkloadIsLoading} onClose={() => {}}>
        <div className="absolute left-0 top-0 flex items-center justify-center w-full h-full bg-white opacity-75">
          <Spinner />
        </div>
      </Dialog>

      {data && <div dangerouslySetInnerHTML={{ __html: data }} id="map" />}
    </>
  )
}

export default Map
