export interface Vertex {
    id: string;
    x: number;
    y: number;
    label: string;
}

export interface Edge {
    source: string;
    target: string;
    weight: number;
}

export interface Graph {
    vertices: Vertex[];
    edges: Edge[];
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export const getShortestPath = (graph: Graph, startLabel: string, endLabel: string): Vertex[] | null => {
    if (graph.vertices.length === 0) {
        return null;
    }

    const dijkstra = (graph: Graph, start: Vertex, end: Vertex) => {
        const dist = new Map<string, number>();
        const prev = new Map<string, Vertex | null>();

        for (const vertex of graph.vertices) {
            dist.set(vertex.id, Infinity);
            prev.set(vertex.id, null);
        }

        dist.set(start.id, 0);

        const unvisited = new Set(graph.vertices);

        while (unvisited.size) {
            let closest: Vertex | null = null;

            for (const vertex of unvisited) {
                if (!closest || dist.get(vertex.id)! < dist.get(closest.id)!) {
                    closest = vertex;
                }
            }

            unvisited.delete(closest!);

            if (closest === end) break;

            for (const edge of graph.edges) {
                if (edge.source === closest?.id || edge.target === closest?.id) {
                    const neighborId = edge.source === closest.id ? edge.target : edge.source;
                    const neighbor = graph.vertices.find((v) => v.id === neighborId)!;

                    if (neighbor) {
                        const alt = dist.get(closest.id)! + edge.weight;
                        if (alt < dist.get(neighbor.id)!) {
                            dist.set(neighbor.id, alt);
                            prev.set(neighbor.id, closest);
                        }
                    }
                }
            }
        }

        const path = [];
        let u = end;
        while (u) {
            path.unshift(u);
            u = prev.get(u.id)!;
        }

        return path;
    };

    const start = graph.vertices.find((v) => v.label === startLabel);
    const end = graph.vertices.find((v) => v.label === endLabel);

    if (!start || !end) return null;

    const path = dijkstra(graph, start, end);

    return path;
};

