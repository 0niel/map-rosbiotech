'use client'

import config from '@/lib/config'
import { createContext, useContext } from 'react'

const ConfigContext = createContext(config)

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  )
}

export const useConfig = () => {
  return useContext(ConfigContext)
}
