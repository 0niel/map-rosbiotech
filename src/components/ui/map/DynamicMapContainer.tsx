import dynamic from 'next/dynamic'

const DynamicMapContainer = dynamic(
    () => import('~/components/ui/map/MapContainer'),
    {
        ssr: true
    }
)

export default DynamicMapContainer
