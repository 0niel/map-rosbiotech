import { create } from "zustand"

interface MapState {
  campus: string
  setCampus: (campus: string) => void
}

export const useMapStore = create<MapState>((set) => ({
  campus: "В-78",
  setCampus: (campus) => set({ campus }),
}))
