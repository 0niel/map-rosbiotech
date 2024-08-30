import MapContainer from '@/components/map/map-container'
import { Suspense } from 'react'

export const maxDuration = 60

export default function Page() {
  return (
    <Suspense>
      <MapContainer />
    </Suspense>
  )
}
