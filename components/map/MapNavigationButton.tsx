import { useRouteStore } from '@/lib/stores/routeStore'
import { Router } from 'lucide-react'

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
      <button
        className="pointer-events-auto flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4"
        onClick={() => {
          props.onClick()
        }}
      >
        <Router className="h-6 w-6" transform="rotate(180)" />
      </button>

      {(startMapObject || endMapObject) && (
        <div className="ml-2 flex flex-row items-center rounded-lg border border-gray-300 bg-white">
          {startMapObject && endMapObject && path && path.length > 0 && (
            <>
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-lg bg-white px-2 py-1 text-sm font-medium text-blue-700 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickShowDetails?.()
                }}
              >
                Детали маршрута
              </button>
              <div className="h-12 w-px bg-gray-200" />
            </>
          )}

          <div className="ml-2 inline-flex h-12 rounded-md border-gray-300">
            {startMapObject && (
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-l-lg bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickStart?.()
                }}
              >
                <p className="mr-3 flex h-4 w-4 items-center justify-center rounded-full  bg-blue-300 font-bold text-blue-700">
                  А
                </p>
                {startMapObject.name}
              </button>
            )}

            {endMapObject && (
              <button
                type="button"
                className="pointer-events-auto inline-flex items-center rounded-r-md bg-white px-2 py-1 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:text-blue-700 focus:ring-2 focus:ring-blue-700 sm:px-4 sm:py-2"
                onClick={() => {
                  props.onClickEnd?.()
                }}
              >
                <p className="mr-3 flex h-4 w-4 items-center justify-center rounded-full  bg-blue-300 font-bold text-blue-700">
                  Б
                </p>
                {endMapObject.name}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapNavigationButton
