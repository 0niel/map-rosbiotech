'use client'

import React from 'react'
import {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'

const sidebarItems = [
  {
    icon: Menu,
    label: 'Главная',
    href: '/'
  }
]

export const Sidebar = () => {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button onClick={() => setOpen(!open)}>
          <span className="sr-only">Открыть боковую панель</span>
          <Menu className="h-6 w-6" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent className="fixed top-0 z-40 h-screen w-64 max-w-full transform overflow-y-auto transition-transform duration-300 ease-in-out">
        <SheetHeader className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <Image
              src="/rbt-logo-dark.svg"
              alt="росбиотех логотип"
              className="w-42 mr-2"
              width={120}
              height={40}
            />
          </div>
          <SheetClose asChild>
            <button
              className="ml-3 inline-flex h-10 items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              onClick={() => setOpen(!open)}
            >
              <span className="sr-only">Закрыть боковую панель</span>
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </SheetClose>
        </SheetHeader>
        <div>
          {sidebarItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-200"
            >
              <item.icon className="h-6 w-6" aria-hidden="true" />
              <span className="ml-3">{item.label}</span>
            </Link>
          ))}
        </div>
        <SheetFooter className="mt-auto p-4">
          <div className="mb-3 flex items-center">
            <Badge variant="secondary">Бета</Badge>
          </div>
          <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
            <p>
              Карта и навигация находится в постоянной разработке. Мы стараемся
              сделать её лучше.
            </p>
          </div>
          <Link
            className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
            href="https://t.me/pulse_rosbiotech/4"
          >
            <p>Сообщить об ошибке</p>
          </Link>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
