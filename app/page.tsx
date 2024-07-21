import { Suspense } from 'react'
import MapContainer from '@/components/map/MapContainer'

export const maxDuration = 60

export default function Page() {
  return (
    <Suspense>
      <MapContainer />
    </Suspense>
  )
}
