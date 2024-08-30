import { useMapStore } from '@/lib/stores/mapStore'
import React from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { PiMapPinPlus } from 'react-icons/pi'
import { Button } from '../ui/button'
import FloorSelectorButtons from './floor-buttons'
import ScaleButtons from './scale-buttons'

interface MapControlsProps {
  floors: number[]
  onZoomIn: () => void
  onZoomOut: () => void
  onNavigatonDialogOpen: () => void
}

const MapControls: React.FC<MapControlsProps> = ({
  floors,
  onZoomIn,
  onZoomOut,
  onNavigatonDialogOpen
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
    <div className="flex w-full flex-row items-end justify-between space-x-4">
      <Button
        className="pointer-events-auto h-14 w-14 rounded-lg border border-input bg-background"
        onClick={() => {
          onNavigatonDialogOpen()
        }}
        variant="secondary"
      >
        <PiMapPinPlus className="h-8 w-8" />
      </Button>

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
    </div>
  )
}

export default MapControls
