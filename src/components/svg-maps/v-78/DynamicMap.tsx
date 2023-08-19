import dynamic from "next/dynamic"
import Spinner from "~/components/ui/Spinner"

const DynamicMap = dynamic(() => import("~/components/svg-maps/v-78/Map"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-white opacity-75">
      <Spinner />
    </div>
  ),
})

export default DynamicMap
