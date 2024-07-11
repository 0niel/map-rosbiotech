export interface Vertex {
    id: string
    x: number
    y: number
    mapObjectId?: string
}

interface Edge {
    source: string
    target: string
    weight: number
    toNextFloor?: boolean
}

export interface Graph {
    vertices: Vertex[]
    edges: Edge[]
}

export const distance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}
