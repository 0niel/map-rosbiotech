import { create } from "zustand"
import { MapDisplayMode } from "~/components/svg-maps/MapDisplayMode"

interface DisplayModeState {
  mode: MapDisplayMode
  timeToDisplay: Date
  setMode: (mode: MapDisplayMode) => void
  setTimeToDisplay: (time: Date) => void
}

export const useDisplayModeStore = create<DisplayModeState>((set) => ({
  mode: MapDisplayMode.DEFAULT,
  timeToDisplay: new Date(),
  setMode: (mode) => set({ mode }),
  setTimeToDisplay: (time) => set({ timeToDisplay: time }),
}))
