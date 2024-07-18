import { MapDisplayMode } from '@/components/svg-maps/MapDisplayMode'
import { create } from 'zustand'

interface DisplayModeState {
  mode: MapDisplayMode
  timeToDisplay: Date
  setMode: (mode: MapDisplayMode) => void
  setTimeToDisplay: (time: Date) => void
}

export const useDisplayModeStore = create<DisplayModeState>(set => ({
  mode: MapDisplayMode.DEFAULT,
  timeToDisplay: new Date(new Date().toString().slice(0, -4)),
  setMode: mode => set({ mode }),
  setTimeToDisplay: time => set({ timeToDisplay: time })
}))
