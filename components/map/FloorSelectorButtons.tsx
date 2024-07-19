import clsx from 'clsx'
import { Button } from '../ui/button'

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
    <div className="flex w-12 flex-col space-y-1 rounded-lg border border-gray-300 bg-gray-50 p-1.5 sm:w-full sm:space-y-2 sm:p-2">
      {floors.map(floor => (
        <Button
          variant={floor === selectedFloor ? 'default' : 'secondary'}
          key={floor}
          type="button"
          className={clsx(
            'pointer-events-auto transition duration-150 ease-in-out sm:p-2'
            // {
            //   'bg-primary/70 text-white hover:bg-primary/85 focus:ring-primary/50':
            //     floor === selectedFloor
            // }
          )}
          onClick={() => onFloorSelect(floor)}
        >
          {floor}
        </Button>
      ))}
    </div>
  )
}

export default FloorSelectorButtons
