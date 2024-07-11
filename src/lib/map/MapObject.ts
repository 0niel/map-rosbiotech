export enum MapObjectType {
    ROOM = 'room',
    TOILET = 'toilet',
    CANTEEN = 'canteen',
    ATM = 'atm',
    STAIRS = 'stairs',
    LECTURE = 'lecture',
    ELEVATOR = 'elevator'
}

export interface MapObject {
    id: string
    type: MapObjectType
    name: string // отображаемое читаемое название объекта
    description?: string
}
