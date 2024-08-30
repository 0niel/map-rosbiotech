'use client'

import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { DialogTitle } from './ui/dialog'
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
import { searchEmployees } from '@/lib/employees/api'
import { type StrapiResponse } from '@/lib/employees/api'
import { MapObjectType } from '@/lib/map/MapObject'
import { useMapStore } from '@/lib/stores/mapStore'
import { cn } from '@/lib/utils'
import { type DialogProps } from '@radix-ui/react-dialog'
import {
  CircleIcon,
  FileIcon,
  LaptopIcon,
  MoonIcon,
  SunIcon
} from '@radix-ui/react-icons'
import { Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import Highlighter from 'react-highlight-words'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { setTheme } = useTheme()
  const [query, setQuery] = React.useState('')

  const { mapData, setSelectedFromSearchRoom } = useMapStore()

  const { data: employeeData, isLoading: employeeIsLoading } =
    useQuery<StrapiResponse>(
      ['searchEmployees', query],
      async () => {
        const employees = await searchEmployees(query)
        const employeesByPositions = []
        for (const employee of employees.data) {
          for (const position of employee.attributes.positions) {
            employeesByPositions.push({
              id: employee.id,
              attributes: {
                ...employee.attributes,
                positions: [position]
              }
            })
          }
        }
        return { data: employeesByPositions }
      },
      { enabled: query !== '' && query.length > 3 }
    )

  const [results, setResults] = React.useState<Record<string, any[]>[]>([])

  React.useEffect(() => {
    if (query.length < 2) return

    const searchResults =
      mapData?.searchObjectsByName(query, [MapObjectType.ROOM]) ?? []
    const newRes = []
    const visitedFloors = new Set()
    for (const res of searchResults) {
      if (!visitedFloors.has(res.floor)) {
        const elementsForThisFloor = searchResults.filter(
          result => result.floor === res.floor
        )
        visitedFloors.add(res.floor)
        newRes.push({ [res.floor]: elementsForThisFloor })
      }
    }

    if (newRes !== results) {
      setResults(newRes)
    }
  }, [query, mapData])

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
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
        setOpen(open => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const onEmployeeClick = (employee: StrapiResponse['data'][0]) => {
    const employeeRooms = employee?.attributes?.positions
      .map(position =>
        position?.contacts.map(contact => contact?.room?.data.attributes)
      )
      .flat()

    if (employeeRooms.length === 1) {
      if (employeeRooms[0]?.name && employeeRooms[0]?.campus) {
        const room = {
          name: employeeRooms[0]?.name,
          campus: employeeRooms[0]?.campus,
          mapObject: null
        }
        setSelectedFromSearchRoom(room)
        setOpen(false)
        return
      }
    }

    toast.error('Не удалось определить аудиторию сотрудника')
  }

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
        variant={'ghost'}
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
          {employeeData?.data && employeeData?.data.length > 0 && (
            <CommandGroup heading="Сотрудники">
              {employeeData.data.map(employee => (
                <CommandItem
                  key={employee.id}
                  onSelect={() => onEmployeeClick(employee)}
                >
                  {employee.attributes.photo && (
                    <Image
                      className="mr-2 h-12 w-12 flex-shrink-0 rounded-full object-cover"
                      src={employee.attributes.photo.data.attributes.url}
                      width={48}
                      height={48}
                      alt={`${employee.attributes.firstName} ${employee.attributes.lastName}`}
                    />
                  )}
                  <div className="flex flex-col">
                    <span>
                      {employee.attributes.lastName}{' '}
                      {employee.attributes.firstName}
                      {employee.attributes.patronymic &&
                        ` ${employee.attributes.patronymic}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {employee.attributes.positions.map(position => (
                        <span key={position.post}>
                          {position.post}, {position.department}
                        </span>
                      ))}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {results.length > 0 && (
            <CommandGroup heading="Аудитории">
              {results.map(object =>
                Object.entries(object).map(([floor, objects]) => (
                  <div key={floor}>
                    <h4 className="py-4 pl-2 text-sm font-medium">{`Этаж ${floor}`}</h4>
                    {objects.map((obj: any) => (
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
                  </div>
                ))
              )}
            </CommandGroup>
          )}
          {query !== '' &&
            employeeData &&
            employeeData.data.length === 0 &&
            results.length === 0 && (
              <CommandEmpty>Результатов не найдено</CommandEmpty>
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
}
