import { type Graph, type Vertex } from './Graph'
import { type MapObject, MapObjectType } from './MapObject'

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
    const data = JSON.parse(json) as {
      floors: { [floor: string]: Graph }
      objects: MapObject[]
    }

    return new MapData(data.floors, data.objects)
  }

  private heuristic(a: Vertex, b: Vertex) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y)
  }

  private reconstructPath(
    cameFrom: Map<Vertex, Vertex | null>,
    currentVertex: Vertex
  ): Vertex[] {
    const path: Vertex[] = []
    while (currentVertex) {
      path.unshift(currentVertex)
      currentVertex = cameFrom.get(currentVertex)!
    }
    return path
  }

  getShortestPath(
    startMapObject: MapObject,
    endMapObject: MapObject
  ): Vertex[] | null {
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
            dist.get(vertex.id)! + this.heuristic(vertex, end) <
            dist.get(current.id)! + this.heuristic(current, end)
          ) {
            current = vertex
          }
        }

        if (!current) break

        unvisited.delete(current)

        if (current === end) break

        for (const edge of graph.edges) {
          if (edge.source === current.id || edge.target === current.id) {
            const neighborId =
              edge.source === current.id ? edge.target : edge.source
            const neighbor = graph.vertices.find(v => v.id === neighborId)!

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

    unpackedGraph.edges.forEach(e => {
      if (e.toNextFloor && e.target) {
        const targetId = unpackedGraph.vertices.find(
          v => v.mapObjectId === e.target
        )?.id
        if (!targetId) return
        e.target = targetId
      }
    })

    const start = unpackedGraph.vertices.find(
      v => v.mapObjectId === startMapObject.id
    )
    const end = unpackedGraph.vertices.find(
      v => v.mapObjectId === endMapObject.id
    )

    if (!start || !end) return null

    const path = aStar(unpackedGraph, start, end)

    return path
  }
  getShortestPathBySegments(
    startMapObject: MapObject,
    endMapObject: MapObject
  ): Vertex[][] | null {
    const path = this.getShortestPath(startMapObject, endMapObject);

    if (!path) return null;

    const pathsBySegments: Vertex[][] = [[path[0] as Vertex]];
    const isTransitionObject = (type: MapObjectType) =>
      type === MapObjectType.STAIRS || type === MapObjectType.ELEVATOR;

    for (let i = 1; i < path.length; i++) {
      const vert = path[i] as Vertex;
      const prevVert = path[i - 1] as Vertex;

      if (!vert.mapObjectId && !prevVert.mapObjectId) {
        pathsBySegments[pathsBySegments.length - 1]?.push(vert);
        continue;
      }

      const mapObj = vert.mapObjectId ? this.getMapObjectById(vert.mapObjectId) : null;
      const prevMapObj = prevVert.mapObjectId
        ? this.getMapObjectById(prevVert.mapObjectId)
        : null;

      if (mapObj && prevMapObj) {
        const isCurrentTransition = isTransitionObject(mapObj.type);
        const isPrevTransition = isTransitionObject(prevMapObj.type);

        if (isCurrentTransition && isPrevTransition) {
          pathsBySegments.push([vert]);
        } else if (isCurrentTransition && !isPrevTransition) {
          pathsBySegments[pathsBySegments.length - 1]?.push(vert);
        } else if (!isCurrentTransition && isPrevTransition) {
          pathsBySegments.push([vert]);
        } else {
          pathsBySegments[pathsBySegments.length - 1]?.push(vert);
        }
      } else {
        pathsBySegments[pathsBySegments.length - 1]?.push(vert);
      }
    }

    return pathsBySegments;
  }


  getNearestMapObjectByType(
    startMapObject: MapObject,
    mapObjectType: MapObjectType,
    mapObjectNames: string[]
  ) {
    let mapObjectsWithTargetType = this.getAllAvailableObjectsInMap().filter(
      o => {
        return o.type === mapObjectType
      }
    )

    if (mapObjectNames.length > 0) {
      mapObjectsWithTargetType = mapObjectsWithTargetType.filter(o => {
        return mapObjectNames.includes(o.name)
      })
    }

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

        const edge = this.unpackedGraph.edges.find(e => {
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
    return this.objects.find(o => o.name === name)
  }

  isObjectInGraph(object: MapObject, graph: Graph): boolean {
    return graph.vertices.some(v => v.mapObjectId === object.id)
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
      { vertices: [], edges: [] }
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

    return this.objects.filter(o => {
      return this.isObjectInGraph(o, unpackedGraph)
    })
  }

  getObjectFloorByMapObjectId(mapObjectId: string): number | undefined {
    const floor = Object.entries(this.floors).find(([_, graph]) => {
      return graph.vertices.some(v => v.mapObjectId === mapObjectId)
    })?.[0]

    return floor ? parseInt(floor) : undefined
  }

  // Возвращает все объекты, которые есть на карте и которые можно искать
  getSearchebleObjects(): SearchableObject[] {
    return this.getAllAvailableObjectsInMap()
      .filter(o => o.type === MapObjectType.ROOM)
      .map(mapObject => ({
        floor: this.getObjectFloorByMapObjectId(mapObject.id)?.toString() || '',
        mapObject: mapObject
      }))
      .sort()
      .filter(o => o.mapObject.name !== '' && o.floor !== '')
  }

  searchObjectsByName(
    name: string,
    mapTypesToSearch: MapObjectType[]
  ): SearchableObject[] {
    const searchObjects = this.getSearchebleObjects()

    const roomNumberPattern =
      /(?<building>[А-Яа-я]+)?-? ?(?<number>\d+)(?<letter>[А-Яа-я])?([-.]?(?<postfix>[А-Яа-я0-9]+))?/

    const normalizedQuery = name.toLowerCase().replace('-', '').replace(' ', '')

    const objectsByRoomName = new Map<string, SearchableObject[]>()

    searchObjects.forEach(o => {
      const roomName = o.mapObject.name
        .toLowerCase()
        .replace('-', '')
        .replace(' ', '')
      if (objectsByRoomName.has(roomName)) {
        objectsByRoomName.get(roomName)?.push(o)
      } else {
        objectsByRoomName.set(roomName, [o])
      }
    })

    const results: SearchableObject[] = []

    for (const [roomName, objects] of objectsByRoomName) {
      if (roomName.includes(normalizedQuery)) {
        for (const o of objects) {
          if (
            mapTypesToSearch.includes(o.mapObject.type) &&
            (!roomName || roomName.includes(normalizedQuery))
          ) {
            const matchObject = o.mapObject.name.match(roomNumberPattern)
            const matchName = name.match(roomNumberPattern)

            if (matchObject && matchName) {
              const buildingObject = matchObject.groups?.building?.toLowerCase()
              const numberObject = matchObject.groups?.number?.toLowerCase()
              const letterObject = matchObject.groups?.letter?.toLowerCase()
              const postfixObject = matchObject.groups?.postfix?.toLowerCase()

              const buildingName = matchName.groups?.building?.toLowerCase()
              const numberName = matchName.groups?.number?.toLowerCase()
              const letterName = matchName.groups?.letter?.toLowerCase()
              const postfixName = matchName.groups?.postfix?.toLowerCase()

              if (
                (numberName && numberObject?.includes(numberName)) ||
                (buildingName && buildingObject?.includes(buildingName)) ||
                (letterName && letterObject === letterName) ||
                (postfixName && postfixObject === postfixName)
              ) {
                results.push(o)
                continue
              }
            }

            results.push(o)
          }
        }
      }
    }

    return results
      .map(o => ({
        floor:
          this.getObjectFloorByMapObjectId(o.mapObject.id)?.toString() || '',
        mapObject: o.mapObject
      }))
      .sort((a, b) => {
        // сначала полное совпадение, потом частичное
        if (a.mapObject.name === name) return -1
        if (b.mapObject.name === name) return 1

        if (a.mapObject.name < b.mapObject.name) return -1
        if (b.mapObject.name > a.mapObject.name) return 1

        return 0
      })
  }

  getMapObjectById(id: string): MapObject | undefined {
    return this.objects.find(o => o.id === id)
  }
}
