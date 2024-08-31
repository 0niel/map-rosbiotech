import { useCallback } from 'react'
import { ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import {
  getAllMapObjectsElements,
  getMapObjectTypeByElement,
  mapObjectSelector
} from '../map/domUtils'
import { MapObjectType } from '../map/MapObject'

type UsePanningStopProps = {
  isPanningRef: React.MutableRefObject<{
    isPanning: boolean
    prevEvent: MouseEvent | null
  }>
  handleRoomClick: (event: Event) => void
}

/**
 * Hook to handle panning stop event. If the time between the start and stop events is less than 200ms,
 * it will trigger the room click event. Otherwise, it will not trigger the room click event.
 * @param isPanningRef - Ref to check if the user is panning
 * @param handleRoomClick - Function to handle the room click event
 */
export const usePanningStop = ({
  isPanningRef,
  handleRoomClick
}: UsePanningStopProps) => {
  return useCallback(
    (ref: ReactZoomPanPinchRef, event: TouchEvent | MouseEvent) => {
      if (isPanningRef.current.prevEvent) {
        const timeDiff =
          event?.timeStamp - isPanningRef.current.prevEvent?.timeStamp
        if (timeDiff < 200) {
          const { clientX, clientY } = isPanningRef.current.prevEvent
          const element = document.elementFromPoint(clientX, clientY)
          const elementWithMapObject = element?.closest(mapObjectSelector)
          const mapObjectElement = getAllMapObjectsElements(document).find(
            el => el === elementWithMapObject
          )

          if (
            mapObjectElement &&
            getMapObjectTypeByElement(mapObjectElement) === MapObjectType.ROOM
          ) {
            handleRoomClick(isPanningRef.current.prevEvent as MouseEvent)
          }
        }
      }

      isPanningRef.current = { isPanning: false, prevEvent: null }
    },
    [handleRoomClick]
  )
}
