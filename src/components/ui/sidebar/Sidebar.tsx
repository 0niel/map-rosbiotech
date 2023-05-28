import Image from "next/image";
import { Home, Link } from "lucide-react";
import SidebarItem, { SidebarItemProps } from "./SidebarItem";

interface SidebarProps {
  collapsed: boolean;
}

const sidebarItems: SidebarItemProps[] = [
  {
    icon: <Home size={24} />,
    label: "Главная",
    href: "/",
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    <aside
      id="logo-sidebar"
      className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0"
      aria-label="Sidebar"
    >
      <div className="h-full overflow-y-auto bg-gray-50 px-3 py-4 dark:bg-gray-800">
        <div className="mb-5 flex items-center pl-2.5">
          <Image
            width={28}
            height={28}
            src="mirea-gerb.svg"
            className="mr-2 h-7 w-7"
            alt="Логотип РТУ МИРЭА"
          />
          <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
            РТУ МИРЭА
          </span>
        </div>
        <ul className="space-y-2 font-medium">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </ul>
      </div>
    </aside>
  );
};
