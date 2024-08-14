import { Button } from '../ui/button'
import clsx from 'clsx'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'

interface FloorSelectorButtonsProps {
  floors: number[]
  selectedFloor: number
  onFloorSelect: (floor: number) => void
}

const FloorSelectorButtons: React.FC<FloorSelectorButtonsProps> = ({
  floors,
  selectedFloor,
  onFloorSelect
}) => {
  return (
    <ScrollArea className="relative h-60 w-12 overflow-auto rounded-lg border border-input bg-background p-1.5 sm:w-full sm:max-w-[60px] sm:p-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
        {/* Верхний градиент затемнения */}
        <div className="absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-background to-transparent"></div>
        {/* Нижний градиент затемнения */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
      </div>
      <div className="space-y-1">
        {floors.map(floor => (
          <Button
            variant={floor === selectedFloor ? 'default' : 'secondary'}
            key={floor}
            type="button"
            className={clsx(
              'pointer-events-auto w-full p-2 transition duration-150 ease-in-out sm:w-10'
            )}
            onClick={() => onFloorSelect(floor)}
          >
            {floor}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  )
}

export default FloorSelectorButtons
