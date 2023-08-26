import React from "react"
import FloorSelectorButtons from "./FloorSelectorButtons"
import ScaleButtons from "./ScaleButtons"
import { useMapStore } from "~/lib/stores/mapStore"

interface MapControlsProps {
  floors: number[]
  onZoomIn: () => void
  onZoomOut: () => void
}

const MapControls: React.FC<MapControlsProps> = ({ floors, onZoomIn, onZoomOut }) => {
  const { floor, setFloor } = useMapStore()
  return (
    <div className="select-none">
      <FloorSelectorButtons floors={floors} selectedFloor={floor} onFloorSelect={(floor) => setFloor(floor)} />
      <div className="mt-4">
        <ScaleButtons onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>
    </div>
  )
}

export default MapControls
