/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react"
import * as d3 from "d3"
import { getShortestPath, type MapData, type Graph, type Vertex } from "~/lib/graph"
import { type MapObject } from "~/lib/map/MapObject"

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

      const currentFloorPath = path.filter((point) => isPointInThisFloor(point, currentFloor))

      const lineFunction = d3
        .line<Vertex>()
        .x((d) => d.x)
        .y((d) => d.y)

      const animationDurationsQueue = []

      // Отрисовка маршрутов
      for (let i = 0; i < currentFloorPath.length - 1; i++) {
        const startPoint = currentFloorPath[i]
        const endPoint = currentFloorPath[i + 1]

        if (startPoint === undefined || endPoint === undefined) {
          continue
        }

        const line = svg
          .append("path")
          .data([[startPoint, endPoint]])
          .attr("class", "route")
          .attr("d", lineFunction)
          .attr("stroke", "#e74694")
          .attr("stroke-width", 8)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
          .attr("fill", "none")
          .attr("stroke-dasharray", function () {
            return this.getTotalLength() + " " + this.getTotalLength()
          })
          .attr("stroke-dashoffset", function () {
            return this.getTotalLength()
          })

        const getAnimationDuration = () => {
          // чем меньше длина линии, тем быстрее анимация
          const lineLegth = line.node()?.getTotalLength() || 0

          return lineLegth / 1000
        }

        line
          .transition()
          .ease(d3.easeLinear)
          .duration(getAnimationDuration() * 1000)
          .delay(animationDurationsQueue.reduce((acc, cur) => acc + cur, 0) * 1000)
          .attr("stroke-dashoffset", 0)
          .on("end", () => {
            line.attr("stroke-dasharray", "none")
          })

        animationDurationsQueue.push(getAnimationDuration())
      }

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
