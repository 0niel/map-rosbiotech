import MapContainer from '@/components/map/MapContainer'
import { Suspense } from 'react'

export const maxDuration = 60

export default function Page() {
  return (
    <Suspense>
      <MapContainer />
    </Suspense>
  )
}
