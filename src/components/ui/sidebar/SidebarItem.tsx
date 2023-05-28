import React from "react";

export interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  badgeText?: string;
  badgeColor?: string;
  href: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  badgeText,
  badgeColor,
  href,
}) => {
  return (
    <li>
      <a
        href={href}
        className="flex items-center rounded-lg p-2 text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
      >
        {icon}
        <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
        {badgeText && (
          <span
            className={`ml-3 inline-flex items-center justify-center rounded-full px-2 text-sm font-medium ${
              badgeColor || "bg-gray-200 text-gray-800"
            }`}
          >
            {badgeText}
          </span>
        )}
      </a>
    </li>
  );
};

export default SidebarItem;
