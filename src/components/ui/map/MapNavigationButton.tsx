import { RiRouteLine } from "react-icons/ri"
import { useRouteStore } from "~/lib/stores/routeStore"

interface MapNavigationButtonProps {
  onClick: () => void

  onClickStart: () => void
  onClickEnd: () => void
  onClickShowDetails: () => void
}

const MapNavigationButton = (props: MapNavigationButtonProps) => {
  const { startMapObject, endMapObject, path } = useRouteStore()

  return (
    <div className="flex justify-center flex-row">
      <button
        className="pointer-events-auto flex items-center justify-center space-y-2 rounded-lg border border-gray-300 bg-gray-50 p-3 sm:p-4"
        onClick={() => {
          props.onClick()
        }}
      >
        <RiRouteLine className="h-6 w-6" transform="rotate(180)" />
      </button>

      {(startMapObject || endMapObject) && (
        <div className="flex flex-row items-center ml-2 rounded-lg border border-gray-300 bg-white">
          {startMapObject && endMapObject && path && path.length > 0 && (
            <>
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium text-blue-700 bg-white rounded-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 pointer-events-auto"
                onClick={() => {
                  props.onClickShowDetails?.()
                }}
              >
                Детали маршрута
              </button>
              <div className="w-px h-12 bg-gray-200" />
            </>
          )}

          <div className="inline-flex rounded-md ml-2 h-12 border-gray-300">
            {startMapObject && (
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-900 bg-white rounded-l-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 pointer-events-auto"
                onClick={() => {
                  props.onClickStart?.()
                }}
              >
                <p className="mr-3 text-blue-700 font-bold bg-blue-300 rounded-full w-4 h-4  flex items-center justify-center">
                  А
                </p>
                {startMapObject.name}
              </button>
            )}

            {endMapObject && (
              <button
                type="button"
                className="inline-flex items-center px-2 py-1 sm:px-4 sm:py-2 text-sm font-medium text-gray-900 bg-white rounded-r-md hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 pointer-events-auto"
                onClick={() => {
                  props.onClickEnd?.()
                }}
              >
                <p className="mr-3 text-blue-700 font-bold bg-blue-300 rounded-full w-4 h-4  flex items-center justify-center">
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
