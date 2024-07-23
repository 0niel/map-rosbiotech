import { Button } from '../ui/button'
import { useRouteStore } from '@/lib/stores/routeStore'
import { Navigation2Icon, Router } from 'lucide-react'

interface MapNavigationButtonProps {
  onClick: () => void

  onClickStart: () => void
  onClickEnd: () => void
  onClickShowDetails: () => void
}

const MapNavigationButton = (props: MapNavigationButtonProps) => {
  const { startMapObject, endMapObject, path } = useRouteStore()

  return (
    <div className="flex flex-row justify-center">
      <Button
        className="dark:border-gray-700-800 pointer-events-auto space-y-2 border border-input bg-background p-3 text-gray-700 hover:text-white dark:text-white sm:px-4 sm:py-6"
        onClick={() => {
          props.onClick()
        }}
      >
        <Navigation2Icon className="h-6 w-6" />
      </Button>

      {(startMapObject || endMapObject) && (
        <div className="ml-2 flex flex-row items-center rounded-lg border border-input bg-background">
          {startMapObject && endMapObject && path && path.length > 0 && (
            <>
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-lg px-2 py-1 text-sm font-medium text-blue-700 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickShowDetails?.()
                }}
              >
                Детали маршрута
              </button>
              <div className="w-p h-12" />
            </>
          )}

          <div className="ml-2 inline-flex h-12 rounded-md border-gray-300">
            {startMapObject && (
              <Button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-l-lg px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickStart?.()
                }}
              >
                <p className="mr-3 flex h-4 w-4 items-center justify-center rounded-full bg-blue-300 font-bold text-blue-700">
                  А
                </p>
                {startMapObject.name}
              </Button>
            )}

            {endMapObject && (
              <Button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-r-md px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickEnd?.()
                }}
              >
                <p className="mr-3 flex h-4 w-4 items-center justify-center rounded-full  bg-blue-300 font-bold text-blue-700">
                  Б
                </p>
                {endMapObject.name}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapNavigationButton
