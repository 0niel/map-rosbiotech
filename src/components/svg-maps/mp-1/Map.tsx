import { memo } from "react"
import Map from "../Map"
import { type MapProps } from "../MapProps"

import FloorMinus1 from "./-1.svg?url"
import Floor1 from "./1.svg?url"
import Floor2 from "./2.svg?url"
import Floor3 from "./3.svg?url"
import Floor4 from "./4.svg?url"
import Floor5 from "./5.svg?url"
import { useMapStore } from "~/lib/stores/mapStore"

const maps = [
  { floor: -1, svgUrl: FloorMinus1.src },
  { floor: 1, svgUrl: Floor1.src },
  { floor: 2, svgUrl: Floor2.src },
  { floor: 3, svgUrl: Floor3.src },
  { floor: 4, svgUrl: Floor4.src },
  { floor: 5, svgUrl: Floor5.src },
]

const MapWrapper = () => {
  const { floor } = useMapStore()
  const currentMap = maps.find((map) => map.floor === floor) as MapProps
  return <Map {...currentMap} />
}

export default memo(MapWrapper)
