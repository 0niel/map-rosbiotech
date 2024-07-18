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
import { Home, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from './ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
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
      <SheetTitle className="sr-only">Боковое меню</SheetTitle>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline">
          <Menu className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Открыть боковое меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs">
        <SheetHeader>
          <div className="flex items-center">
            <Image
              src="/rbt-logo-dark.svg"
              alt="росбиотех логотип"
              className="w-42 mr-2"
              width={120}
              height={40}
            />
          </div>
        </SheetHeader>

        <div className="mt-4 flex-1">
          <nav className="text-md grid items-start gap-2 font-medium lg:px-4">
            {sidebarItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <SheetFooter className="mt-4">
          <Card>
            <CardHeader className="flex items-start px-4 pb-2 pt-4">
              <Badge variant="secondary">Бета</Badge>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Карта и навигация находится в постоянной разработке. Мы
                стараемся сделать её лучше.
              </CardDescription>
              <div className="text-left">
                <Link href="https://t.me/pulse_rosbiotech/4">
                  <Button variant="link" className="p-0">
                    Сообщить об ошибке
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
