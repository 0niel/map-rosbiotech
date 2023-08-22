import { MapObjectType, type MapObject } from "./map/MapObject"

export interface Vertex {
  id: string
  x: number
  y: number
  mapObjectId?: string
}

export interface Edge {
  source: string
  target: string
  weight: number
  toNextFloor?: boolean
}

export interface Graph {
  vertices: Vertex[]
  edges: Edge[]
}

export interface MapData {
  floors: { [floor: string]: Graph }
  objects: MapObject[]
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export const getShortestPath = (data: MapData, startMapObject: MapObject, endMapObject: MapObject) => {
  const dijkstra = (graph: Graph, start: Vertex, end: Vertex) => {
    const dist = new Map<string, number>()
    const prev = new Map<string, Vertex | null>()

    for (const vertex of graph.vertices) {
      dist.set(vertex.id, Infinity)
      prev.set(vertex.id, null)
    }

    dist.set(start.id, 0)

    const unvisited = new Set(graph.vertices)

    while (unvisited.size) {
      let closest: Vertex | null = null

      for (const vertex of unvisited) {
        if (!closest || dist.get(vertex.id)! < dist.get(closest.id)!) {
          closest = vertex
        }
      }

      unvisited.delete(closest!)

      if (closest === end) break

      for (const edge of graph.edges) {
        if (edge.source === closest?.id || edge.target === closest?.id) {
          const neighborId = edge.source === closest.id ? edge.target : edge.source
          const neighbor = graph.vertices.find((v) => v.id === neighborId)!

          if (neighbor) {
            // Добавьте это условие для проверки существования соседа
            const alt = dist.get(closest.id)! + edge.weight
            if (alt < dist.get(neighbor.id)!) {
              dist.set(neighbor.id, alt)
              prev.set(neighbor.id, closest)
            }
          }
        }
      }
    }

    const path = []
    let u = end
    while (u) {
      path.unshift(u)
      u = prev.get(u.id)!
    }

    return path
  }

  const unpackedGraph = unpackGraph(data)

  unpackedGraph.edges.forEach((e) => {
    if (e.toNextFloor && e.target) {
      const targetId = unpackedGraph.vertices.find((v) => v.mapObjectId === e.target)?.id
      if (!targetId) return
      e.target = targetId
    }
  })

  const start = unpackedGraph.vertices.find((v) => v.mapObjectId === startMapObject.id)
  const end = unpackedGraph.vertices.find((v) => v.mapObjectId === endMapObject.id)

  if (!start || !end) return null

  const path = dijkstra(unpackedGraph, start, end)

  return path
}

export const getObjectByName = (name: string, data: MapData): MapObject | undefined => {
  return data.objects.find((o) => o.name === name)
}

export const isObjectInGraph = (object: MapObject, graph: Graph): boolean => {
  return graph.vertices.some((v) => v.mapObjectId === object.id)
}

// Объединяет графы этажей в один граф
export const unpackGraph = (mapData: MapData): Graph => {
  return Object.values(mapData.floors).reduce(
    (acc, g) => {
      acc.vertices.push(...g.vertices)
      acc.edges.push(...g.edges)
      return acc
    },
    { vertices: [], edges: [] },
  )
}

// Возвращает все объекты, которые есть в графе и в массиве объектов, то есть объекты, которые есть на карте
export const getAllAvailableObjectsInMap = (data: MapData): MapObject[] => {
  const unpackedGraph = unpackGraph(data)

  return data.objects.filter((o) => {
    return isObjectInGraph(o, unpackedGraph)
  })
}

export const getObjectFloorByMapObjectId = (mapObjectId: string, data: MapData): number | undefined => {
  const floor = Object.entries(data.floors).find(([_, graph]) => {
    return graph.vertices.some((v) => v.mapObjectId === mapObjectId)
  })?.[0]

  return floor ? parseInt(floor) : undefined
}

export interface SearchableObject {
  floor: string
  mapObject: MapObject
}

export const getSearchebleObjects = (data: MapData): SearchableObject[] => {
  return getAllAvailableObjectsInMap(data)
    .filter((o) => o.type === MapObjectType.ROOM)
    .map((mapObject) => ({
      floor: getObjectFloorByMapObjectId(mapObject.id, data)?.toString() || "",
      mapObject: mapObject,
    }))
    .sort()
    .filter((o) => o.mapObject.name !== "" && o.floor !== "")
}

const roomNumberPattern = /(?<building>[А-Яа-я]+)?-?(?<number>\d+)(?<letter>[А-Яа-я])?([-.]?(?<postfix>[А-Яа-я0-9]+))?/

export const searchObjectsByName = (
  name: string,
  data: MapData,
  searchObjects: SearchableObject[],
  mapTypesToSearch: MapObjectType[],
): SearchableObject[] => {
  return searchObjects
    .filter((o) => {
      if (o.mapObject.type === MapObjectType.ROOM && mapTypesToSearch.includes(MapObjectType.ROOM)) {
        const matchObject = o.mapObject.name.match(roomNumberPattern)
        const matchName = name.match(roomNumberPattern)

        if (matchObject && matchName) {
          const buildingObject = matchObject.groups?.building
          const numberObject = matchObject.groups?.number
          const letterObject = matchObject.groups?.letter
          const postfixObject = matchObject.groups?.postfix

          const buildingName = matchName.groups?.building
          const numberName = matchName.groups?.number
          const letterName = matchName.groups?.letter
          const postfixName = matchName.groups?.postfix

          if (numberName) {
            if (!numberObject?.toLowerCase().includes(numberName.toLowerCase())) {
              return false
            }
          }

          if (buildingName) {
            if (!buildingObject?.toLowerCase().includes(buildingName.toLowerCase())) {
              return false
            }
          }

          if (letterName) {
            if (letterObject?.toLowerCase() !== letterName.toLowerCase()) {
              return false
            }
          }

          if (postfixName) {
            if (postfixObject?.toLowerCase() !== postfixName.toLowerCase()) {
              return false
            }
          }
        }
      }

      return o.mapObject.name.toLowerCase().includes(name.toLowerCase()) && mapTypesToSearch.includes(o.mapObject.type)
    })
    .map((o) => ({
      floor: getObjectFloorByMapObjectId(o.mapObject.id, data)?.toString() || "",
      mapObject: o.mapObject,
    }))
    .sort((a, b) => {
      // сначала полное совпадение, потом частичное
      if (a.mapObject.name === name) return -1
      if (b.mapObject.name === name) return 1

      if (a.mapObject.name < b.mapObject.name) return -1
      if (a.mapObject.name > b.mapObject.name) return 1

      return 0
    })
}
