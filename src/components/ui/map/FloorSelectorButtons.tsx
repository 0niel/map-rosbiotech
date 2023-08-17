import clsx from "clsx";

interface FloorSelectorButtonsProps {
  floors: number[];
  selectedFloor: number;
  onFloorSelect: (floor: number) => void;
}

const FloorSelectorButtons: React.FC<FloorSelectorButtonsProps> = ({
  floors,
  selectedFloor,
  onFloorSelect,
}) => {
  return (
    <div className="flex flex-col space-y-2 rounded-lg p-2 border border-gray-300 bg-gray-50">
      {floors.map((floor) => (
        <button
          key={floor}
          type="button"
          className={clsx(
            "rounded-lg p-2 text-sm font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 pointer-events-auto",
            {
              "bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-500":
                floor === selectedFloor,
            }
          )}
          onClick={() => onFloorSelect(floor)}
        >
          {floor}
        </button>
      ))}
    </div>
  );
};

export default FloorSelectorButtons;
