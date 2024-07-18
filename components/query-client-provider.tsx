'use client'

import * as React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24
    }
  }
})

interface CustomQueryClientProviderProps {
  children: React.ReactNode
}

export function CustomQueryClientProvider({
  children
}: CustomQueryClientProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
