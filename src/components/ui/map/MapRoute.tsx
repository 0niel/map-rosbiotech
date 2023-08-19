/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef, useState, useImperativeHandle, forwardRef } from "react"
import * as d3 from "d3"
import { getShortestPath, type Graph, type Vertex } from "~/lib/graph"

interface MapRouteProps {
  graph: Graph
  className?: string
}

export interface MapRouteRef {
  renderRoute: (startLabel: string, endLabel: string) => void
}

const MapRoute = forwardRef<MapRouteRef, MapRouteProps>((props, ref) => {
  const [shortestPath, setShortestPath] = useState<Vertex[]>([])
  const svgRef = useRef<SVGSVGElement | null>(null)

  const [graph, setGraph] = useState<Graph>(props.graph)

  const [startLabel, setStartLabel] = useState<string | null>(null)
  const [endLabel, setEndLabel] = useState<string | null>(null)

  useImperativeHandle(ref, () => ({
    renderRoute: (startLabel: string, endLabel: string) => {
      setStartLabel(startLabel)
      setEndLabel(endLabel)

      const path = getShortestPath(graph, startLabel, endLabel)

      setShortestPath(path || [])

      if (!path) return

      if (!svgRef.current || path.length === 0) return

      const svg = d3.select(svgRef.current)

      // Очистить предыдущие маршруты
      svg.selectAll("line.route").remove()

      // Отрисовка маршрутов
      for (let i = 0; i < path.length - 1; i++) {
        const startPoint = path[i]
        const endPoint = path[i + 1]

        if (startPoint === undefined || endPoint === undefined) {
          continue
        }

        svg
          .append("line")
          .attr("class", "route")
          .attr("x1", startPoint.x)
          .attr("y1", startPoint.y)
          .attr("x2", endPoint.x)
          .attr("y2", endPoint.y)
          .attr("stroke", "red")
          .attr("stroke-width", 5)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round")
      }
    },
  }))

  return <svg ref={svgRef} width={"100%"} height={"100%"} className={props.className}></svg>
})

MapRoute.displayName = "MapRoute"

export default MapRoute
