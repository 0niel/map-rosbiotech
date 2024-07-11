import { Badge, Sidebar as FbSidebar } from 'flowbite-react'
import Link from 'next/link'
import Image from 'next/image'
import { HiMap, HiX } from 'react-icons/hi'
import clsx from 'clsx'
import React from 'react'

const sidebarItems = [
    {
        icon: HiMap,
        label: 'Главная',
        href: '/'
    }
]

interface SidebarProps {
    open: boolean
    setOpen: (open: boolean) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
    return (
        <FbSidebar
            collapsed={false}
            aria-label="sidebar"
            id="sidebar"
            role="navigation"
            className={clsx(
                'fixed top-0 z-40 h-screen w-64 max-w-full transform overflow-y-auto transition-transform duration-300 ease-in-out',
                {
                    'translate-x-0': open,
                    '-translate-x-full': !open
                }
            )}
        >
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Image
                        src="rbt-logo-dark.svg"
                        alt="росбиотех логотип"
                        className="mr-2 w-42"
                        width={120}
                        height={40}
                    />
                    {/* <p className="text-xl font-bold text-gray-800 dark:text-gray-200 sm:text-2xl sm:font-semibold">Карта</p> */}
                </div>
                <button
                    className="ml-3 inline-flex h-10 items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    onClick={() => setOpen(!open)}
                >
                    <span className="sr-only">Закрыть боковую панель</span>
                    <HiX className="h-6 w-6" aria-hidden="true" />
                </button>
            </div>

            <FbSidebar.Items>
                <FbSidebar.ItemGroup>
                    {sidebarItems.map(item => (
                        <FbSidebar.Item
                            key={item.href}
                            href={item.href}
                            icon={item.icon}
                        >
                            <p>{item.label}</p>
                        </FbSidebar.Item>
                    ))}
                </FbSidebar.ItemGroup>
            </FbSidebar.Items>

            {/* Кнопки настройки отображения */}
            <div></div>

            <FbSidebar.CTA>
                <div className="mb-3 flex items-center">
                    <Badge color="warning">Бета</Badge>
                </div>
                <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
                    <p>
                        Карта и навигация находится в постоянной разработке. Мы
                        стараемся сделать её лучше.
                    </p>
                </div>
                <Link
                    className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
                    href="https://t.me/pulse_rosbiotech/4"
                >
                    <p>Сообщить об ошибке</p>
                </Link>
            </FbSidebar.CTA>
        </FbSidebar>
    )
}
