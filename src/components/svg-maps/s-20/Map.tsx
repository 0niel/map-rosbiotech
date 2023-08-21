import React, { useEffect } from "react"
import Floor1 from "./floor_1.svg?url"
import Floor2 from "./floor_2.svg?url"
import Floor3 from "./floor_3.svg?url"
import Floor4 from "./floor_4.svg?url"
import { useQuery } from "react-query"
import Spinner from "~/components/ui/Spinner"
import { Dialog } from "@headlessui/react"
import { fetchSvg } from "../fetchSvg"

const Map = ({ floor, onLoaded }: { floor: number; onLoaded?: () => void }) => {
  const url =
    {
      1: Floor1,
      2: Floor2,
      3: Floor3,
      4: Floor4,
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
