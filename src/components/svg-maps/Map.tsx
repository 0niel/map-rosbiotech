import { useEffect } from "react"
import { useQuery } from "react-query"
import Spinner from "~/components/ui/Spinner"
import { Dialog } from "@headlessui/react"
import { fetchSvg } from "./fetchSvg"
import { type MapProps } from "./MapProps"

const Map = ({ floor, onLoaded, svgUrl }: MapProps) => {
  const { isLoading, data } = useQuery(["map", floor], {
    queryFn: async () => fetchSvg(svgUrl),
    onError: (error) => {
      console.error(error)
    },
  })

  useEffect(() => {
    if (document.querySelector("#map svg")) {
      onLoaded?.()
      return
    }
  }, [data])

  return (
    <>
      <Dialog open={isLoading} onClose={() => {}}>
        <div className="absolute left-0 top-0 flex items-center justify-center w-full h-full bg-white opacity-75">
          <Spinner />
        </div>
      </Dialog>

      {data && <div dangerouslySetInnerHTML={{ __html: data }} id="map" />}
    </>
  )
}

export default Map
