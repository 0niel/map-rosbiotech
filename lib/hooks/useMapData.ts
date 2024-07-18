import { useEffect } from 'react'
import { MapData } from '@/lib/map/MapData'
import mapDataJson from '@/public/routes.json'
import { useMapStore } from '@/lib/stores/mapStore'

const loadJsonToGraph = (routesJson: string) => {
    return MapData.fromJson(routesJson)
}

export const useMapData = () => {
    const { setMapData } = useMapStore()

    useEffect(() => {
        const mapData = loadJsonToGraph(JSON.stringify(mapDataJson))
        setMapData(mapData)
    }, [setMapData])
}
