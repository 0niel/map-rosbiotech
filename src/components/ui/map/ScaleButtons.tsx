import { Plus, Minus, RotateCcw } from "lucide-react"
import React from "react"

interface ScaleButtonsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

const ScaleButtons: React.FC<ScaleButtonsProps> = ({ onZoomIn, onZoomOut, onReset }) => {
  const buttonStyle =
    "rounded-lg sm:p-2 p-1 sm:text-sm text-xs font-medium transition duration-150 ease-in-out hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 active:bg-blue-700 active:text-white active:ring-blue-500 pointer-events-auto"

  return (
    <div className="flex flex-col space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-2 w-12 sm:w-full">
      <button type="button" className={buttonStyle} onClick={onReset}>
        <RotateCcw size={24} />
      </button>
      <div>
        <hr className="border-gray-300" />
      </div>
      <button type="button" className={buttonStyle} onClick={onZoomIn}>
        <Plus size={24} />
      </button>
      <div>
        <hr className="border-gray-300" />
      </div>
      <button type="button" className={buttonStyle} onClick={onZoomOut}>
        <Minus size={24} />
      </button>
    </div>
  )
}

export default ScaleButtons
