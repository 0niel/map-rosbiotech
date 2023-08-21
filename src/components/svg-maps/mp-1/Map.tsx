import FloorMinus1 from "./-1.svg?url"
import Floor1 from "./1.svg?url"
import Floor2 from "./2.svg?url"
import Floor3 from "./3.svg?url"
import Floor4 from "./4.svg?url"
import Floor5 from "./5.svg?url"
import { useQuery } from "react-query"
import Spinner from "~/components/ui/Spinner"
import { Dialog } from "@headlessui/react"
import { fetchSvg } from "../fetchSvg"
import { useEffect } from "react"

const Map = ({ floor, onLoaded }: { floor: number; onLoaded?: () => void }) => {
  const url =
    {
      "-1": FloorMinus1,
      1: Floor1,
      2: Floor2,
      3: Floor3,
      4: Floor4,
      5: Floor5,
    }[floor]?.src ?? ""

  const { isLoading, data } = useQuery(["map", floor], {
    queryFn: async () => fetchSvg(url),
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
