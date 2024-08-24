'use client'

import { Button } from '../ui/button'
import clsx from 'clsx'
import { ScrollArea, ScrollBar } from '../ui/scroll-area'
import { useState, useEffect, useRef } from 'react'

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
  const [isScrollable, setIsScrollable] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      setIsScrollable(container.scrollHeight > container.clientHeight)
    }
  }, [floors])

  const buttonHeight = 42
  const maxHeight = 6 * buttonHeight + 2 * 1.5
  const containerHeight = floors.length * buttonHeight + 2 * 3 * floors.length

  return (
    <ScrollArea
      ref={containerRef}
      className={clsx(
        'relative w-14 overflow-auto rounded-lg border border-input bg-background p-1.5 sm:w-full sm:max-w-[60px] sm:p-2',
        {
          'h-60': floors.length > 6,
          'h-auto': floors.length <= 6
        }
      )}
      style={{ height: `${Math.min(containerHeight, maxHeight)}px` }}
    >
      {isScrollable && (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
          {/* Верхний градиент затемнения */}
          <div className="absolute left-0 right-0 top-0 h-6 bg-gradient-to-b from-background to-transparent"></div>
          {/* Нижний градиент затемнения */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      )}
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
