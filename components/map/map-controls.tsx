import React from 'react'
import FloorSelectorButtons from './floor-buttons'
import ScaleButtons from './ScaleButtons'
import { useMapStore } from '@/lib/stores/mapStore'
import { useHotkeys } from 'react-hotkeys-hook'

interface MapControlsProps {
  floors: number[]
  onZoomIn: () => void
  onZoomOut: () => void
}

const MapControls: React.FC<MapControlsProps> = ({
  floors,
  onZoomIn,
  onZoomOut
}) => {
  const { floor, setFloor } = useMapStore()

  useHotkeys('up', () => {
    const newFloor = floors[floors.indexOf(floor) - 1]
    if (newFloor !== undefined) {
      setFloor(newFloor)
    }
  })

  useHotkeys('down', () => {
    const newFloor = floors[floors.indexOf(floor) + 1]
    if (newFloor !== undefined) {
      setFloor(newFloor)
    }
  })

  return (
    <div className="select-none">
      <FloorSelectorButtons
        floors={floors}
        selectedFloor={floor}
        onFloorSelect={floor => setFloor(floor)}
      />
      <div className="mt-4">
        <ScaleButtons onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      </div>
    </div>
  )
}

export default MapControls
