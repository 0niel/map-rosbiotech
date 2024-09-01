'use client'

import { Button } from '@/components/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { type StrapiResponse } from '@/lib/employees/api'
import { MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import { cn } from '@/lib/utils'
import { DialogProps } from '@radix-ui/react-dialog'
import {
  CircleIcon,
  LaptopIcon,
  MoonIcon,
  SunIcon
} from '@radix-ui/react-icons'
import { Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import React from 'react'
import { toast } from 'sonner'
import { DialogTitle } from './ui/dialog'

export const CommandMenu = React.memo(function CommandMenu({
  ...props
}: DialogProps) {
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()
  const [query, setQuery] = React.useState('')

  const { mapData, setSelectedFromSearchRoom } = useMapStore()

  const calculateMatchPercentage = (name: string, query: string): number => {
    const nameLower = name.toLowerCase()
    const queryLower = query.toLowerCase()
    let matchCount = 0

    for (let i = 0; i < queryLower.length; i++) {
      if (nameLower.includes(queryLower[i]!)) {
        matchCount++
      }
    }

    return (matchCount / queryLower.length) * 100
  }

  const results = React.useMemo(() => {
    if (query.length < 2) return []

    const searchResults =
      mapData?.searchObjectsByName(query, [MapObjectType.ROOM]) ?? []

    const rankedResults = searchResults
      .map(res => ({
        ...res,
        matchPercentage: calculateMatchPercentage(res.mapObject.name, query)
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 30) // Обрезаем до 30 результатов

    const groupedResults = rankedResults.reduce(
      (acc, res) => {
        if (!acc[res.floor]) acc[res.floor] = []
        if (acc[res.floor]) {
          acc[res.floor]!.push(res)
        }
        return acc
      },
      {} as Record<string, any[]>
    )

    return Object.entries(groupedResults).map(([floor, objects]) => ({
      floor,
      objects
    }))
  }, [query, mapData])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return
        }

        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const onEmployeeClick = React.useCallback(
    (employee: StrapiResponse['data'][0]) => {
      const employeeRooms = employee?.attributes?.positions
        .flatMap(position =>
          position?.contacts.map(contact => contact?.room?.data.attributes)
        )
        .filter(Boolean)

      if (employeeRooms.length === 1) {
        const room = employeeRooms[0]
        if (room?.name && room?.campus) {
          setSelectedFromSearchRoom({
            name: room.name,
            campus: room.campus,
            mapObject: null
          })
          setOpen(false)
          return
        }
      }

      toast.error('Не удалось определить аудиторию сотрудника')
    },
    [setSelectedFromSearchRoom]
  )

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative hidden w-80 justify-start bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 lg:block lg:pl-2'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">
          Поиск аудиторий или сотрудников...
        </span>
        <span className="inline-flex lg:hidden">Поиск...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.6rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Button
        className="mr-2 lg:hidden"
        onClick={() => setOpen(true)}
        variant="ghost"
      >
        <span className="sr-only">Поиск</span>
        <Search className="h-6 w-6" aria-hidden="true" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">
          Поиск аудиторий или сотрудников...
        </DialogTitle>
        <CommandInput
          placeholder="Введите или выберите команду..."
          onValueChange={setQuery}
        />

        <CommandList>
          {query === '' && (
            <CommandEmpty>
              Введите запрос для поиска сотрудников или аудиторий
            </CommandEmpty>
          )}

          {results.length > 0 && (
            <CommandGroup heading="Аудитории">
              {results.map(({ floor, objects }) => (
                <React.Fragment key={floor}>
                  <h4 className="py-4 pl-2 text-sm font-medium">{`Этаж ${floor}`}</h4>
                  {objects.map(obj => (
                    <CommandItem
                      key={obj.mapObject.id}
                      onSelect={() => {
                        setSelectedFromSearchRoom({
                          name: obj.mapObject.name,
                          campus: '',
                          mapObject: obj.mapObject
                        })
                        setOpen(false)
                      }}
                      value={obj.mapObject.name}
                    >
                      <div className="mr-2 flex h-4 w-4 items-center justify-center">
                        <CircleIcon className="h-3 w-3" />
                      </div>
                      {obj.mapObject.name}
                    </CommandItem>
                  ))}
                </React.Fragment>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Тема">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunIcon className="mr-2 h-4 w-4" />
              Светлая
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <MoonIcon className="mr-2 h-4 w-4" />
              Тёмная
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <LaptopIcon className="mr-2 h-4 w-4" />
              Системная
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
})
