import { type Graph, type Vertex } from "./Graph"
import { MapObjectType, type MapObject } from "./MapObject"

export interface SearchableObject {
  floor: string
  mapObject: MapObject
}

export class MapData {
  floors: { [floor: string]: Graph }
  objects: MapObject[]

  constructor(floors: { [floor: string]: Graph }, objects: MapObject[]) {
    this.floors = floors
    this.objects = objects
  }

  static fromJson(json: string): MapData {
    const data = JSON.parse(json) as { floors: { [floor: string]: Graph }; objects: MapObject[] }

    return new MapData(data.floors, data.objects)
  }

  private heuristic(a: Vertex, b: Vertex) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  private reconstructPath(cameFrom: Map<Vertex, Vertex | null>, currentVertex: Vertex): Vertex[] {
    const path: Vertex[] = []
    while (currentVertex) {
      path.unshift(currentVertex)
      currentVertex = cameFrom.get(currentVertex)!
    }
    return path
  }

  getShortestPath(startMapObject: MapObject, endMapObject: MapObject): Vertex[] | null {
    const aStar = (graph: Graph, start: Vertex, end: Vertex) => {
      const dist = new Map<string, number>()
      const prev = new Map<string, Vertex | null>()

      for (const vertex of graph.vertices) {
        dist.set(vertex.id, Infinity)
        prev.set(vertex.id, null)
      }

      dist.set(start.id, 0)

      const unvisited = new Set(graph.vertices)

      do {
        let current: Vertex | null = null

        for (const vertex of unvisited) {
          if (
            !current ||
            dist.get(vertex.id)! + this.heuristic(vertex, end) < dist.get(current.id)! + this.heuristic(current, end)
          ) {
            current = vertex
          }
        }

        if (!current) break

        unvisited.delete(current)

        if (current === end) break

        for (const edge of graph.edges) {
          if (edge.source === current.id || edge.target === current.id) {
            const neighborId = edge.source === current.id ? edge.target : edge.source
            const neighbor = graph.vertices.find((v) => v.id === neighborId)!

            if (neighbor) {
              const alt = dist.get(current.id)! + edge.weight
              if (alt < dist.get(neighbor.id)!) {
                dist.set(neighbor.id, alt)
                prev.set(neighbor.id, current)
              }
            }
          }
        }
      } while (unvisited.size)

      const path = []
      let u = end
      while (u) {
        path.unshift(u)
        u = prev.get(u.id)!
      }

      return path
    }

    const unpackedGraph = this.unpackedGraph

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

    const path = aStar(unpackedGraph, start, end)

    return path
  }

  getShortestPathBySegments(startMapObject: MapObject, endMapObject: MapObject): Vertex[][] | null {
    const path = this.getShortestPath(startMapObject, endMapObject)

    // Список сегментов пути, разделенных лестницами
    const pathsByStairs = [] as Vertex[][]

    if (!path) return null

    // Первый сегмент пути всегда начинается с начальной точки
    pathsByStairs.push([path[0] as Vertex])

    for (let i = 1; i < path.length; i++) {
      const vert = path[i] as Vertex
      const prevVert = path[i - 1] as Vertex

      if (!vert.mapObjectId && !prevVert.mapObjectId) {
        ;(pathsByStairs[pathsByStairs.length - 1] as Vertex[]).push(vert)
        continue
      }

      const mapObj = this.getMapObjectById(vert.mapObjectId as string)
      const prevMapObj = this.getMapObjectById(prevVert.mapObjectId as string)

      if (mapObj && prevMapObj) {
        if (mapObj.type === MapObjectType.STAIRS && prevMapObj.type === MapObjectType.STAIRS) {
          // Если оба объекта лестницы, то добавить новый сегмент пути
          pathsByStairs.push([vert])
        } else if (mapObj.type === MapObjectType.STAIRS && prevMapObj.type !== MapObjectType.STAIRS) {
          // Если текущий объект лестница, а предыдущий нет, то добавить текущий объект в последний сегмент пути
          ;(pathsByStairs[pathsByStairs.length - 1] as Vertex[]).push(vert)
        } else if (mapObj.type !== MapObjectType.STAIRS && prevMapObj.type === MapObjectType.STAIRS) {
          // Если текущий объект не лестница, а предыдущий объект лестница, то добавить текущий объект в новый сегмент пути
          pathsByStairs.push([vert])
        } else if (mapObj.type !== MapObjectType.STAIRS && prevMapObj.type !== MapObjectType.STAIRS) {
          // Если оба объекта не лестницы, то добавить текущий объект в последний сегмент пути
          ;(pathsByStairs[pathsByStairs.length - 1] as Vertex[]).push(vert)
        }
      } else {
        ;(pathsByStairs[pathsByStairs.length - 1] as Vertex[]).push(vert)
      }
    }

    return pathsByStairs
  }

  getNearestMapObjectByType(startMapObject: MapObject, mapObjectType: MapObjectType, mapObjectNames: string[]) {
    const mapObjectsWithTargetType = this.getAllAvailableObjectsInMap().filter((o) => {
      return o.type === mapObjectType && mapObjectNames.includes(o.name)
    })

    let minDistance = Infinity
    let nearestObject = null

    for (const object of mapObjectsWithTargetType) {
      if (object.id === startMapObject.id) continue

      const path = this.getShortestPath(startMapObject, object)
      if (!path || path.length === 1) continue

      let distance = 0
      for (let i = 0; i < path.length - 1; i++) {
        const currentVertex = path[i]
        const nextVertex = path[i + 1]

        if (!currentVertex || !nextVertex) continue

        const edge = this.unpackedGraph.edges.find((e) => {
          return (
            (e.source === currentVertex.id && e.target === nextVertex.id) ||
            (e.target === currentVertex.id && e.source === nextVertex.id)
          )
        })

        if (!edge) continue

        distance += edge.weight
      }

      if (distance < minDistance) {
        minDistance = distance
        nearestObject = object
      }
    }

    return nearestObject
  }

  getObjectByName(name: string): MapObject | undefined {
    return this.objects.find((o) => o.name === name)
  }

  isObjectInGraph(object: MapObject, graph: Graph): boolean {
    return graph.vertices.some((v) => v.mapObjectId === object.id)
  }

  private lazyUnpackedGraph: Graph | null = null

  // Объединяет графы этажей в один граф
  get unpackedGraph(): Graph {
    if (this.lazyUnpackedGraph) return this.lazyUnpackedGraph

    this.lazyUnpackedGraph = Object.values(this.floors).reduce(
      (acc, g) => {
        acc.vertices.push(...g.vertices)
        acc.edges.push(...g.edges)
        return acc
      },
      { vertices: [], edges: [] },
    )

    return this.lazyUnpackedGraph
  }

  getFloorByPoint = (point: Vertex) => {
    for (const floor in this.floors) {
      if (this.floors[floor]?.vertices.includes(point)) {
        return parseInt(floor)
      }
    }

    return 0
  }

  // Возвращает все объекты, которые есть в графе и в массиве объектов, то есть объекты, которые есть на карте
  getAllAvailableObjectsInMap(): MapObject[] {
    const unpackedGraph = this.unpackedGraph

    return this.objects.filter((o) => {
      return this.isObjectInGraph(o, unpackedGraph)
    })
  }

  getObjectFloorByMapObjectId(mapObjectId: string): number | undefined {
    const floor = Object.entries(this.floors).find(([_, graph]) => {
      return graph.vertices.some((v) => v.mapObjectId === mapObjectId)
    })?.[0]

    return floor ? parseInt(floor) : undefined
  }

  // Возвращает все объекты, которые есть на карте и которые можно искать
  getSearchebleObjects(): SearchableObject[] {
    return this.getAllAvailableObjectsInMap()
      .filter((o) => o.type === MapObjectType.ROOM)
      .map((mapObject) => ({
        floor: this.getObjectFloorByMapObjectId(mapObject.id)?.toString() || "",
        mapObject: mapObject,
      }))
      .sort()
      .filter((o) => o.mapObject.name !== "" && o.floor !== "")
  }

  searchObjectsByName(name: string, mapTypesToSearch: MapObjectType[]): SearchableObject[] {
    const searchObjects = this.getSearchebleObjects()

    const roomNumberPattern =
      /(?<building>[А-Яа-я]+)?-? ?(?<number>\d+)(?<letter>[А-Яа-я])?([-.]?(?<postfix>[А-Яа-я0-9]+))?/

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

        return (
          o.mapObject.name
            .toLowerCase()
            .replace("-", "")
            .replace(" ", "")
            .includes(name.toLowerCase().replace("-", "").replace(" ", "")) &&
          mapTypesToSearch.includes(o.mapObject.type)
        )
      })
      .map((o) => ({
        floor: this.getObjectFloorByMapObjectId(o.mapObject.id)?.toString() || "",
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

  getMapObjectById(id: string): MapObject | undefined {
    return this.objects.find((o) => o.id === id)
  }
}
