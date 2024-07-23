import { Classroom } from '../schedule/models/classroom'
import { MapObject } from './MapObject'

export interface RoomOnMap {
  element: Element
  // Базовое состояние комнаты, которое восстанавливается после клика на другую комнату
  baseElement: Element
  name: string
  // Если null, то в API нет информации о комнате
  remote: Classroom | null

  mapObject: MapObject
}
