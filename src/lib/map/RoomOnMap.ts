import { type components } from "~/lib/schedule/schema"
import { MapObject } from "./MapObject"

export interface RoomOnMap {
  element: Element
  // Базовое состояние комнаты, которое восстанавливается после клика на другую комнату
  baseElement: Element
  name: string
  // Если null, то в API нет информации о комнате
  remote: components["schemas"]["Room"] | null

  mapObject: MapObject
}
