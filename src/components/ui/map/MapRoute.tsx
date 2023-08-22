/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react"
import * as d3 from "d3"
import { getShortestPath, type MapData, type Graph, type Vertex, getMapObjectById } from "~/lib/graph"
import { MapObjectType, type MapObject } from "~/lib/map/MapObject"

interface MapRouteProps {
  mapData: MapData
  className?: string
}

export interface MapRouteRef {
  renderRoute: (startMapObject: MapObject, endMapObject: MapObject, currentFloor: number) => void
  clearRoute: () => void
}

const MapRoute = forwardRef<MapRouteRef, MapRouteProps>((props, ref) => {
  const [shortestPath, setShortestPath] = useState<Vertex[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [mapData, setMapData] = useState<MapData>(props.mapData)

  const isPointInThisFloor = (point: Vertex, floor: number) => {
    const floorGraph = mapData.floors[floor.toString()]
    if (!floorGraph) return false

    return floorGraph.vertices.includes(point)
  }

  const getFloorByPoint = (point: Vertex) => {
    for (const floor in mapData.floors) {
      if (mapData.floors[floor]?.vertices.includes(point)) {
        return parseInt(floor)
      }
    }

    return 0
  }

  useImperativeHandle(ref, () => ({
    renderRoute: (startMapObject, endMapObject, currentFloor) => {
      const path = getShortestPath(mapData, startMapObject, endMapObject)
      if (!path || path.length === 1) return

      if (!svgRef.current) return

      const svg = d3.select(svgRef.current)

      // Очистить предыдущие маршруты и точки
      svg.selectAll(".route").remove()
      svg.selectAll(".circle-point").remove()

      let currentFloorPath = path.filter((point) => isPointInThisFloor(point, currentFloor))

      console.log(currentFloorPath)

      // Если две лестницы на одном этаже, то текущий путь заканчивается на второй лестнице
      // Такое бывает, когда две части карты являются фактически разными корпусами, но на одном этаже
      // Например, когда Киберзона -> ивц
      let lastPointIndex = currentFloorPath.length - 1
      for (let i = 1; i < currentFloorPath.length; i++) {
        const vert = currentFloorPath[i] as Vertex
        const prevVert = currentFloorPath[i - 1] as Vertex

        if (!vert.mapObjectId || !prevVert.mapObjectId) continue

        const mapObj = getMapObjectById(vert.mapObjectId, mapData)
        const prevMapObj = getMapObjectById(prevVert.mapObjectId, mapData)

        if (!mapObj || !prevMapObj) continue

        console.log(mapObj, prevMapObj)
        if (mapObj.type === MapObjectType.STAIRS && prevMapObj.type === MapObjectType.STAIRS) {
          lastPointIndex = i - 1
          break
        }
      }

      currentFloorPath = currentFloorPath.slice(0, lastPointIndex + 1)

      const lineFunction = d3
        .line<Vertex>()
        .x((d) => d.x)
        .y((d) => d.y)
        .curve(d3.curveLinear)

      const animationDurationsQueue = []

      const line = svg
        .append("path")
        .attr("class", "route")
        .attr("d", lineFunction(currentFloorPath))
        .attr("stroke", "#e74694")
        .attr("stroke-width", 6)
        .attr("fill", "none")
        .attr("stroke-dasharray", "0,0") // чтобы не было видно линии при первом рендере

      line
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attrTween("stroke-dasharray", function (this) {
          const len = this.getTotalLength()
          return function (t) {
            return `${len * t}, ${len * (1 - t)}`
          }
        })

      const drawCirclePoint = (point: Vertex, text: string) => {
        const circlePoints = svg
          .append("g")
          .attr("class", "circle-point")
          .selectAll(".circle-point")
          .data([point])
          .enter()

        circlePoints
          .append("circle")
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("r", 18)
          .attr("fill", "#e74694")

        circlePoints
          .append("text")
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("fill", "#fff")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "18px")
          .attr("font-weight", "bold")
          .text(text)
      }

      const startPoint = path[0] || ({ x: 0, y: 0 } as Vertex)
      const endPoint = path[path.length - 1] || ({ x: 0, y: 0 } as Vertex)

      const startFloor = getFloorByPoint(startPoint)
      const endFloor = getFloorByPoint(endPoint)

      const firstCurrentFloorPoint = currentFloorPath[0] || ({ x: 0, y: 0 } as Vertex)
      const lastCurrentFloorPoint = currentFloorPath[currentFloorPath.length - 1] || ({ x: 0, y: 0 } as Vertex)

      if (startFloor === currentFloor) {
        drawCirclePoint(startPoint, "A")
      }

      if (endFloor === currentFloor) {
        drawCirclePoint(endPoint, "B")
      }

      if (startFloor === currentFloor && endFloor === currentFloor) {
        return
      }

      if (endFloor < currentFloor) {
        drawCirclePoint(lastCurrentFloorPoint, "↓")
      } else if (endFloor > currentFloor) {
        drawCirclePoint(lastCurrentFloorPoint, "↑")
      }

      drawCirclePoint(firstCurrentFloorPoint, "")
    },
    clearRoute: () => {
      if (!svgRef.current) return

      const svg = d3.select(svgRef.current)

      svg.selectAll(".route").remove()
      svg.selectAll(".circle-point").remove()
    },
  }))

  return <svg ref={svgRef} width={"100%"} height={"100%"} className={props.className}></svg>
})

MapRoute.displayName = "MapRoute"

export default MapRoute
