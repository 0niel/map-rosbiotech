import { Badge, Sidebar as FbSidebar } from 'flowbite-react';
import Link from 'next/link';
import { HiMap } from 'react-icons/hi';
import clsx from 'clsx';


const sidebarItems = [
  {
    icon: HiMap,
    label: "Главная",
    href: "/",
  },
];

interface SidebarProps {
  collapsed: boolean;
}


export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <FbSidebar aria-label="Боковая панель" className="fixed top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0">
      <FbSidebar.Logo
        href="#"
        img="mirea-gerb.svg"
        imgAlt="РТУ МИРЭА герб"
      >
        <p>
          РТУ МИРЭА
        </p>
      </FbSidebar.Logo>
      <FbSidebar.Items>
        <FbSidebar.ItemGroup>
          {sidebarItems.map((item) => (
            <FbSidebar.Item
              key={item.href}
              href={item.href}
              icon={item.icon}
              >
              <p>
                {item.label}
              </p>
              </FbSidebar.Item>
          ))}
        
        </FbSidebar.ItemGroup>
      </FbSidebar.Items>
      <FbSidebar.CTA>
        <div className="mb-3 flex items-center">
          <Badge color="warning">
            Бета
          </Badge>
          <button
            aria-label="Close"
            className="-m-1.5 ml-auto inline-flex h-6 w-6 rounded-lg bg-gray-100 p-1 text-cyan-900 hover:bg-gray-200 focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
            type="button"
          >
            
          </button>
        </div>
        <div className="mb-3 text-sm text-cyan-900 dark:text-gray-400">
          <p>
            Карта и навигация находится в постоянной разработке. Мы стараемся сделать её лучше.
          </p>
        </div>
        <Link
          className="text-sm text-cyan-900 underline hover:text-cyan-800 dark:text-gray-400 dark:hover:text-gray-300"
          href="https://t.me/mirea_help_bot"
        >
          <p>
            Сообщить об ошибке
          </p>
        </Link>
      </FbSidebar.CTA>
    </FbSidebar>
  );
};
