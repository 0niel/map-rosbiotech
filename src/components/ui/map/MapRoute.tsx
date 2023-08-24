/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from "react"
import * as d3 from "d3"
import { type MapData } from "~/lib/map/MapData"
import { type Graph, type Vertex } from "~/lib/map/Graph"
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
      //  Пути, разделенные на сегменты (по этажам, разделенным лестницами)
      const path = mapData.getShortestPathBySegments(startMapObject, endMapObject)

      if (!path || path.length === 0) {
        return
      }

      if (!svgRef.current) return

      const svg = d3.select(svgRef.current)

      // Очистить предыдущие маршруты и точки
      svg.selectAll(".route").remove()
      svg.selectAll(".circle-point").remove()

      // Все точки, которые находятся на всех этажах
      const allPoints = path.reduce((acc, points) => [...acc, ...points], [])

      const startPoint = allPoints[0] || ({ x: 0, y: 0 } as Vertex)
      const endPoint = allPoints[allPoints.length - 1] || ({ x: 0, y: 0 } as Vertex)

      const startFloor = getFloorByPoint(startPoint)
      const endFloor = getFloorByPoint(endPoint)

      for (const pathSegment of path) {
        if (!pathSegment || !pathSegment[0] || !isPointInThisFloor(pathSegment[0], currentFloor)) {
          continue
        }

        const lineFunction = d3
          .line<Vertex>()
          .x((d) => d.x)
          .y((d) => d.y)
          .curve(d3.curveLinear)

        const line = svg
          .append("path")
          .attr("class", "route absolute z-10")
          .attr("d", lineFunction(pathSegment))
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
            .attr("stroke", "#fff")
            .attr("stroke-width", 3)

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

        const firstCurrentFloorPoint = pathSegment[0] || ({ x: 0, y: 0 } as Vertex)
        const lastCurrentFloorPoint = pathSegment[pathSegment.length - 1] || ({ x: 0, y: 0 } as Vertex)

        if (isPointInThisFloor(startPoint, currentFloor)) {
          drawCirclePoint(startPoint, "А")
        } else drawCirclePoint(firstCurrentFloorPoint, "")

        if (isPointInThisFloor(endPoint, currentFloor)) {
          drawCirclePoint(endPoint, "Б")
        }

        if (endFloor < currentFloor) {
          drawCirclePoint(lastCurrentFloorPoint, "↓")
        } else if (endFloor > currentFloor) {
          drawCirclePoint(lastCurrentFloorPoint, "↑")
        } else if (startFloor === endFloor) {
          // Если начальная точка и кочная точка находятся на одном этаже, но, на пример, в разных корпусах.
          // И чтобы до них дойти, нужно подниматься или спускаться по лестницам
          const currentSegmentLastPoint = pathSegment[pathSegment.length - 1] || ({ x: 0, y: 0 } as Vertex)
          const pointAfterCurrentSegment = allPoints[allPoints.indexOf(currentSegmentLastPoint) + 1]
          if (pointAfterCurrentSegment) {
            const pointFloor = getFloorByPoint(pointAfterCurrentSegment)
            if (pointFloor < currentFloor) {
              drawCirclePoint(lastCurrentFloorPoint, "↓")
            } else if (pointFloor > currentFloor) {
              drawCirclePoint(lastCurrentFloorPoint, "↑")
            }
          }
        }
      }
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
