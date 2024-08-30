import { useRouteStore } from '@/lib/stores/routeStore'
import { XIcon } from 'lucide-react'
import { Button } from '../ui/button'
import RouteDetails, { DetailsSlide } from './route-details'

interface MapNavigationButtonProps {
  onClickStart: () => void
  onClickEnd: () => void
  onClearRoute: () => void
}

const MapNavigationButton = (props: MapNavigationButtonProps) => {
  const { startMapObject, endMapObject, path } = useRouteStore()

  return (
    <div className="pointer-events-auto flex flex-row items-center justify-center space-x-2 pl-4 md:pl-24">
      {(startMapObject || endMapObject) && (
        <div className="flex flex-row items-center space-x-2 rounded-lg border border-input bg-background p-2">
          {startMapObject && endMapObject && path && path.length > 0 && (
            <RouteDetails
              onDetailsSlideChange={function (
                detailsSlide: DetailsSlide
              ): void {}}
              onDetailsSlideClick={function (
                detailsSlide: DetailsSlide
              ): void {}}
            />
          )}

          <div className="inline-flex space-x-1 rounded-md border-gray-300">
            {startMapObject && (
              <Button
                type="button"
                className="focu inline-flex items-center rounded-l-lg px-4 py-2 text-sm font-medium focus:z-10"
                onClick={() => {
                  props.onClickStart?.()
                }}
                variant={'secondary'}
              >
                <p className="mr-2 flex h-4 w-4 items-center justify-center rounded-full font-bold">
                  А
                </p>
                {startMapObject.name}
              </Button>
            )}

            {endMapObject && (
              <Button
                type="button"
                className="inline-flex items-center rounded-r-md px-4 py-2 text-sm font-medium focus:z-10"
                onClick={() => {
                  props.onClickEnd?.()
                }}
                variant={'secondary'}
              >
                <p className="mr-2 flex h-4 w-4 items-center justify-center rounded-full font-bold">
                  Б
                </p>
                {endMapObject.name}
              </Button>
            )}
          </div>

          <Button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-red-600"
            variant={'outline'}
            onClick={() => {
              props.onClearRoute?.()
            }}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Clear route</span>
          </Button>
        </div>
      )}
    </div>
  )
}

export default MapNavigationButton
