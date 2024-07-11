import dynamic from 'next/dynamic'
import { memo } from 'react'

const DynamicMap = dynamic(() => import('./Map'), {
    ssr: false
})

export default memo(DynamicMap)
