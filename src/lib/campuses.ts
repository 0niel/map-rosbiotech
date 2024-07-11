import V78Map from '~/components/svg-maps/v-78/DynamicMap'

export interface Campus {
    shortName: string
    description: string
    map: React.FC
    floors: number[]
    initialFloor: number
    initialScale: number
    initialPositionX: number
    initialPositionY: number
}

const campuses: Campus[] = [
    {
        shortName: 'Сокол',
        description: 'Волоколамское шоссе, 11',
        map: V78Map,
        floors: [1],
        initialFloor: 2,
        initialScale: 0.2,
        initialPositionX: -600,
        initialPositionY: -134
    }
]

export const initialCampus = campuses[0] as Campus

export default campuses
