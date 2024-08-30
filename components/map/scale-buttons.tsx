import { Button } from '../ui/button'
import { Minus, Plus } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'

interface ScaleButtonsProps {
  onZoomIn: () => void
  onZoomOut: () => void
}

const ScaleButtons: React.FC<ScaleButtonsProps> = ({ onZoomIn, onZoomOut }) => {
  const buttonStyle =
    'select-none sm:p-2 p-1 transition duration-150 ease-in-out active:text-white hover:text-white active:ring-primary/50 pointer-events-auto text-gray-700 bg-background dark:text-white'
  useHotkeys('=', onZoomIn) // plus button
  useHotkeys('-', onZoomOut)

  return (
    <div className="flex w-14 flex-col space-y-2 rounded-lg border border-input bg-background  p-2 sm:w-full">
      <Button type="button" className={buttonStyle} onClick={onZoomIn}>
        <Plus size={24} />
      </Button>
      <div>
        <hr className="border-gray-300 dark:border-gray-700" />
      </div>
      <Button type="button" className={buttonStyle} onClick={onZoomOut}>
        <Minus size={24} />
      </Button>
    </div>
  )
}

export default ScaleButtons
