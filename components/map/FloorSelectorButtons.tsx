import clsx from 'clsx'

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
        <button
          key={floor}
          type="button"
          className={clsx(
            'pointer-events-auto rounded-lg p-1 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-300 sm:p-2',
            {
              'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-500':
                floor === selectedFloor
            }
          )}
          onClick={() => onFloorSelect(floor)}
        >
          {floor}
        </button>
      ))}
    </div>
  )
}

export default FloorSelectorButtons
