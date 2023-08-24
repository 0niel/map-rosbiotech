import { memo } from "react"
import Map from "../Map"
import { type MapProps } from "../MapProps"

import Floor0 from "./floor_0.svg?url"
import Floor1 from "./floor_1.svg?url"
import Floor2 from "./floor_2.svg?url"
import Floor3 from "./floor_3.svg?url"
import Floor4 from "./floor_4.svg?url"
import { MapData } from "~/lib/map/MapData"

const maps = [
  { floor: 0, svgUrl: Floor0.src },
  { floor: 1, svgUrl: Floor1.src },
  { floor: 2, svgUrl: Floor2.src },
  { floor: 3, svgUrl: Floor3.src },
  { floor: 4, svgUrl: Floor4.src },
]

const MapWrapper = ({ floor, mapData }: { floor: number; mapData: MapData }) => {
  const currentMap = maps.find((map) => map.floor === floor) as MapProps
  return <Map {...currentMap} mapData={mapData} />
}

export default memo(MapWrapper)
