import dynamic from "next/dynamic"
import { memo } from "react"
import Spinner from "~/components/ui/Spinner"

const DynamicMap = dynamic(() => import("~/components/svg-maps/v-78/Map"), {
  ssr: false,
})

export default memo(DynamicMap)
