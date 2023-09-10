import { useState, useEffect } from "react"
import { X } from "lucide-react"

interface RightDrawerProps {
  isOpen: boolean
  onClose: () => void
  titleComponent?: React.ReactNode
  children: React.ReactNode
}

const RightDrawer: React.FC<RightDrawerProps> = ({ titleComponent, children, isOpen, onClose }) => {
  const [drawerOpened, setDrawerOpened] = useState<boolean>(isOpen)

  useEffect(() => {
    setDrawerOpened(isOpen)
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  const drawerClass = drawerOpened ? "translate-x-0" : "translate-x-full"

  return (
    <div
      id="drawer-right"
      className={`fixed right-0 top-0 z-40 overflow-y-auto p-4 transition-transform ${drawerClass} bg-white z-50 md:w-96 w-full h-full md:shadow-sm md:overflow-y-auto`}
      tabIndex={-1}
      aria-labelledby="drawer-right-label"
    >
      {titleComponent}
      <button
        type="button"
        onClick={handleClose}
        aria-controls="drawer-right"
        className="absolute right-2.5 top-4 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Закрыть меню</span>
      </button>
      {children}
    </div>
  )
}

export default RightDrawer
